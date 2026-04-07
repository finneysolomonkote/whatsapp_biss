import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface Campaign {
  id?: string;
  tenant_id: string;
  name: string;
  description?: string;
  message_template: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
  scheduled_at?: string;
  target_segment?: Record<string, any>;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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
    const campaignId = pathParts[pathParts.length - 1];

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

    switch (req.method) {
      case 'GET': {
        if (campaignId && campaignId !== 'campaigns-service') {
          if (pathParts.includes('stats')) {
            const { data: campaign } = await supabase
              .from('campaigns')
              .select('*')
              .eq('id', campaignId)
              .eq('tenant_id', tenantId)
              .single();

            if (!campaign) {
              return new Response(
                JSON.stringify({ error: 'Campaign not found' }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }

            const stats = {
              total_recipients: campaign.total_recipients,
              sent_count: campaign.sent_count,
              delivered_count: campaign.delivered_count,
              read_count: campaign.read_count,
              replied_count: campaign.replied_count,
              failed_count: campaign.failed_count,
              delivery_rate: campaign.total_recipients > 0
                ? (campaign.delivered_count / campaign.total_recipients * 100).toFixed(2)
                : 0,
              read_rate: campaign.delivered_count > 0
                ? (campaign.read_count / campaign.delivered_count * 100).toFixed(2)
                : 0,
            };

            return new Response(
              JSON.stringify({ success: true, data: stats }),
              { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          const { data, error } = await supabase
            .from('campaigns')
            .select('*')
            .eq('id', campaignId)
            .eq('tenant_id', tenantId)
            .single();

          if (error) throw error;

          return new Response(
            JSON.stringify({ success: true, data }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          const page = parseInt(url.searchParams.get('page') || '1');
          const limit = parseInt(url.searchParams.get('limit') || '50');
          const status = url.searchParams.get('status');

          let query = supabase
            .from('campaigns')
            .select('*', { count: 'exact' })
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });

          if (status) {
            query = query.eq('status', status);
          }

          const { data, error, count } = await query
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
      }

      case 'POST': {
        const body: Campaign = await req.json();

        const { data: contacts } = await supabase
          .from('contacts')
          .select('id', { count: 'exact' })
          .eq('tenant_id', tenantId);

        const totalRecipients = contacts?.length || 0;

        const { data, error } = await supabase
          .from('campaigns')
          .insert({
            tenant_id: tenantId,
            name: body.name,
            description: body.description,
            message_template: body.message_template,
            status: body.status || 'draft',
            scheduled_at: body.scheduled_at,
            target_segment: body.target_segment || {},
            total_recipients: totalRecipients,
            sent_count: 0,
            delivered_count: 0,
            read_count: 0,
            replied_count: 0,
            failed_count: 0,
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, data }),
          { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'PUT': {
        if (!campaignId || campaignId === 'campaigns-service') {
          return new Response(
            JSON.stringify({ error: 'Campaign ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const body: Partial<Campaign> = await req.json();

        const { data, error } = await supabase
          .from('campaigns')
          .update({
            name: body.name,
            description: body.description,
            message_template: body.message_template,
            status: body.status,
            scheduled_at: body.scheduled_at,
            target_segment: body.target_segment,
            updated_at: new Date().toISOString(),
          })
          .eq('id', campaignId)
          .eq('tenant_id', tenantId)
          .select()
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, data }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'DELETE': {
        if (!campaignId || campaignId === 'campaigns-service') {
          return new Response(
            JSON.stringify({ error: 'Campaign ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error } = await supabase
          .from('campaigns')
          .delete()
          .eq('id', campaignId)
          .eq('tenant_id', tenantId);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, message: 'Campaign deleted successfully' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
