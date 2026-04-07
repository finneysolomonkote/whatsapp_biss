import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, X-Webhook-Signature',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const provider = pathParts[pathParts.length - 1];

    switch (provider) {
      case 'whatsapp': {
        if (req.method !== 'POST') {
          return new Response(
            JSON.stringify({ error: 'Method not allowed' }),
            { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const body = await req.json();

        if (body.object === 'whatsapp_business_account') {
          for (const entry of body.entry || []) {
            for (const change of entry.changes || []) {
              if (change.field === 'messages') {
                for (const message of change.value.messages || []) {
                  const contactPhone = message.from;
                  const messageText = message.text?.body || '';

                  let contact = await supabase
                    .from('contacts')
                    .select('*')
                    .eq('phone', contactPhone)
                    .maybeSingle();

                  if (!contact.data) {
                    const { data: newContact } = await supabase
                      .from('contacts')
                      .insert({
                        phone: contactPhone,
                        first_name: contactPhone,
                        tenant_id: entry.id,
                      })
                      .select()
                      .single();

                    contact.data = newContact;
                  }

                  if (contact.data) {
                    let conversation = await supabase
                      .from('conversations')
                      .select('*')
                      .eq('contact_id', contact.data.id)
                      .eq('status', 'open')
                      .maybeSingle();

                    if (!conversation.data) {
                      const { data: newConversation } = await supabase
                        .from('conversations')
                        .insert({
                          tenant_id: contact.data.tenant_id,
                          contact_id: contact.data.id,
                          status: 'open',
                          last_message_at: new Date().toISOString(),
                          last_message_preview: messageText.substring(0, 100),
                          unread_count: 1,
                        })
                        .select()
                        .single();

                      conversation.data = newConversation;
                    }

                    if (conversation.data) {
                      await supabase.from('messages').insert({
                        tenant_id: contact.data.tenant_id,
                        conversation_id: conversation.data.id,
                        contact_id: contact.data.id,
                        content: messageText,
                        direction: 'inbound',
                        status: 'delivered',
                        timestamp: new Date().toISOString(),
                        external_id: message.id,
                      });

                      await supabase
                        .from('conversations')
                        .update({
                          last_message_at: new Date().toISOString(),
                          last_message_preview: messageText.substring(0, 100),
                          unread_count: (conversation.data.unread_count || 0) + 1,
                        })
                        .eq('id', conversation.data.id);

                      const { data: workflows } = await supabase
                        .from('workflows')
                        .select('*')
                        .eq('tenant_id', contact.data.tenant_id)
                        .eq('status', 'active')
                        .in('trigger_type', ['message_received', 'keyword']);

                      for (const workflow of workflows || []) {
                        if (workflow.trigger_type === 'keyword') {
                          const keyword = workflow.trigger_config?.keyword?.toLowerCase();
                          if (keyword && messageText.toLowerCase().includes(keyword)) {
                            await supabase
                              .from('workflows')
                              .update({
                                execution_count: (workflow.execution_count || 0) + 1,
                              })
                              .eq('id', workflow.id);
                          }
                        } else if (workflow.trigger_type === 'message_received') {
                          await supabase
                            .from('workflows')
                            .update({
                              execution_count: (workflow.execution_count || 0) + 1,
                            })
                            .eq('id', workflow.id);
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'razorpay': {
        if (req.method !== 'POST') {
          return new Response(
            JSON.stringify({ error: 'Method not allowed' }),
            { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const body = await req.json();
        const signature = req.headers.get('X-Razorpay-Signature');

        const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');
        if (webhookSecret && signature) {
          const crypto = await import('node:crypto');
          const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(JSON.stringify(body))
            .digest('hex');

          if (expectedSignature !== signature) {
            return new Response(
              JSON.stringify({ error: 'Invalid signature' }),
              { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }

        const event = body.event;
        const payload = body.payload.payment.entity;

        switch (event) {
          case 'payment.authorized':
          case 'payment.captured': {
            await supabase
              .from('payments')
              .update({
                payment_id: payload.id,
                status: 'completed',
                completed_at: new Date().toISOString(),
              })
              .eq('order_id', payload.order_id);
            break;
          }

          case 'payment.failed': {
            await supabase
              .from('payments')
              .update({
                status: 'failed',
                failure_reason: payload.error_description,
              })
              .eq('order_id', payload.order_id);
            break;
          }

          case 'refund.created': {
            await supabase
              .from('payments')
              .update({
                status: 'refunded',
                refund_id: payload.id,
                refunded_at: new Date().toISOString(),
              })
              .eq('payment_id', payload.payment_id);
            break;
          }
        }

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'register': {
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

        if (req.method === 'POST') {
          const body: { url: string; events: string[]; provider: string } = await req.json();

          const crypto = await import('node:crypto');
          const secret = crypto.randomBytes(32).toString('hex');

          const { data, error } = await supabase
            .from('webhook_registrations')
            .insert({
              tenant_id: tenantData.id,
              url: body.url,
              events: body.events,
              provider: body.provider,
              secret,
              status: 'active',
            })
            .select()
            .single();

          if (error) throw error;

          return new Response(
            JSON.stringify({ success: true, data }),
            { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else if (req.method === 'GET') {
          const { data, error } = await supabase
            .from('webhook_registrations')
            .select('*')
            .eq('tenant_id', tenantData.id);

          if (error) throw error;

          return new Response(
            JSON.stringify({ success: true, data }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid webhook provider' }),
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
