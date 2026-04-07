import { createClient } from 'npm:@supabase/supabase-js@2';
import Razorpay from 'npm:razorpay@2.9.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface CreateOrderRequest {
  amount: number;
  currency: string;
  receipt?: string;
  notes?: Record<string, any>;
}

interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!razorpayKeyId || !razorpayKeySecret) {
      return new Response(
        JSON.stringify({ error: 'Razorpay credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const action = pathParts[pathParts.length - 1];

    const { data: tenantData } = await supabase
      .from('tenants')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (!tenantData) {
      return new Response(
        JSON.stringify({ error: 'Tenant not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tenantId = tenantData.id;

    switch (action) {
      case 'create-order': {
        if (req.method !== 'POST') {
          return new Response(
            JSON.stringify({ error: 'Method not allowed' }),
            { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const body: CreateOrderRequest = await req.json();

        const orderOptions = {
          amount: body.amount * 100,
          currency: body.currency || 'INR',
          receipt: body.receipt || `receipt_${Date.now()}`,
          notes: {
            tenant_id: tenantId,
            user_id: user.id,
            ...body.notes,
          },
        };

        const order = await razorpay.orders.create(orderOptions);

        await supabase.from('payments').insert({
          tenant_id: tenantId,
          user_id: user.id,
          order_id: order.id,
          amount: body.amount,
          currency: body.currency || 'INR',
          status: 'created',
          payment_gateway: 'razorpay',
          metadata: { notes: body.notes },
        });

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              order_id: order.id,
              amount: order.amount,
              currency: order.currency,
              key_id: razorpayKeyId,
            },
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'verify-payment': {
        if (req.method !== 'POST') {
          return new Response(
            JSON.stringify({ error: 'Method not allowed' }),
            { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const body: VerifyPaymentRequest = await req.json();

        const crypto = await import('node:crypto');
        const expectedSignature = crypto
          .createHmac('sha256', razorpayKeySecret)
          .update(`${body.razorpay_order_id}|${body.razorpay_payment_id}`)
          .digest('hex');

        const isValid = expectedSignature === body.razorpay_signature;

        if (isValid) {
          await supabase
            .from('payments')
            .update({
              payment_id: body.razorpay_payment_id,
              status: 'completed',
              completed_at: new Date().toISOString(),
            })
            .eq('order_id', body.razorpay_order_id)
            .eq('tenant_id', tenantId);

          return new Response(
            JSON.stringify({
              success: true,
              message: 'Payment verified successfully',
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          await supabase
            .from('payments')
            .update({
              status: 'failed',
              failure_reason: 'Invalid signature',
            })
            .eq('order_id', body.razorpay_order_id)
            .eq('tenant_id', tenantId);

          return new Response(
            JSON.stringify({
              success: false,
              error: 'Payment verification failed',
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      case 'payment-history': {
        if (req.method !== 'GET') {
          return new Response(
            JSON.stringify({ error: 'Method not allowed' }),
            { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '50');

        const { data, error, count } = await supabase
          .from('payments')
          .select('*', { count: 'exact' })
          .eq('tenant_id', tenantId)
          .order('created_at', { ascending: false })
          .range((page - 1) * limit, page * limit - 1);

        if (error) throw error;

        return new Response(
          JSON.stringify({
            success: true,
            data,
            pagination: {
              page,
              limit,
              total: count,
              totalPages: Math.ceil((count || 0) / limit),
            },
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'refund': {
        if (req.method !== 'POST') {
          return new Response(
            JSON.stringify({ error: 'Method not allowed' }),
            { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const body: { payment_id: string; amount?: number } = await req.json();

        const { data: payment } = await supabase
          .from('payments')
          .select('*')
          .eq('payment_id', body.payment_id)
          .eq('tenant_id', tenantId)
          .single();

        if (!payment) {
          return new Response(
            JSON.stringify({ error: 'Payment not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const refundAmount = body.amount ? body.amount * 100 : payment.amount * 100;

        const refund = await razorpay.payments.refund(body.payment_id, {
          amount: refundAmount,
        });

        await supabase
          .from('payments')
          .update({
            status: 'refunded',
            refund_id: refund.id,
            refunded_at: new Date().toISOString(),
          })
          .eq('payment_id', body.payment_id)
          .eq('tenant_id', tenantId);

        return new Response(
          JSON.stringify({
            success: true,
            data: refund,
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
