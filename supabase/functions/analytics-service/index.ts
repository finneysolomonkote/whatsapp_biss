import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

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

    if (req.method !== 'GET') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    switch (action) {
      case 'dashboard': {
        const { data: contacts, count: contactsCount } = await supabase
          .from('contacts')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenantId);

        const { data: conversations, count: conversationsCount } = await supabase
          .from('conversations')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .eq('status', 'open');

        const { data: campaigns, count: campaignsCount } = await supabase
          .from('campaigns')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .eq('status', 'active');

        const now = new Date();
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const { data: recentMessages, count: messagesCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .gte('timestamp', last30Days.toISOString());

        const { data: workflows } = await supabase
          .from('workflows')
          .select('execution_count')
          .eq('tenant_id', tenantId)
          .eq('status', 'active');

        const totalExecutions = workflows?.reduce((sum, w) => sum + (w.execution_count || 0), 0) || 0;

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              total_contacts: contactsCount || 0,
              active_conversations: conversationsCount || 0,
              active_campaigns: campaignsCount || 0,
              messages_last_30_days: messagesCount || 0,
              workflow_executions: totalExecutions,
            },
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'message-stats': {
        const startDate = url.searchParams.get('start_date') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const endDate = url.searchParams.get('end_date') || new Date().toISOString();

        const { data: messages } = await supabase
          .from('messages')
          .select('direction, status, timestamp')
          .eq('tenant_id', tenantId)
          .gte('timestamp', startDate)
          .lte('timestamp', endDate);

        const inbound = messages?.filter(m => m.direction === 'inbound').length || 0;
        const outbound = messages?.filter(m => m.direction === 'outbound').length || 0;
        const delivered = messages?.filter(m => m.status === 'delivered').length || 0;
        const read = messages?.filter(m => m.status === 'read').length || 0;
        const failed = messages?.filter(m => m.status === 'failed').length || 0;

        const dailyStats: Record<string, { inbound: number; outbound: number }> = {};
        messages?.forEach(msg => {
          const date = new Date(msg.timestamp).toISOString().split('T')[0];
          if (!dailyStats[date]) {
            dailyStats[date] = { inbound: 0, outbound: 0 };
          }
          if (msg.direction === 'inbound') {
            dailyStats[date].inbound++;
          } else {
            dailyStats[date].outbound++;
          }
        });

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              summary: {
                total: messages?.length || 0,
                inbound,
                outbound,
                delivered,
                read,
                failed,
              },
              daily: Object.entries(dailyStats).map(([date, stats]) => ({
                date,
                ...stats,
              })),
            },
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'campaign-performance': {
        const { data: campaigns } = await supabase
          .from('campaigns')
          .select('*')
          .eq('tenant_id', tenantId)
          .order('created_at', { ascending: false })
          .limit(10);

        const performance = campaigns?.map(campaign => ({
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          total_recipients: campaign.total_recipients,
          sent_count: campaign.sent_count,
          delivered_count: campaign.delivered_count,
          read_count: campaign.read_count,
          replied_count: campaign.replied_count,
          delivery_rate: campaign.total_recipients > 0
            ? ((campaign.delivered_count / campaign.total_recipients) * 100).toFixed(2)
            : 0,
          read_rate: campaign.delivered_count > 0
            ? ((campaign.read_count / campaign.delivered_count) * 100).toFixed(2)
            : 0,
          reply_rate: campaign.delivered_count > 0
            ? ((campaign.replied_count / campaign.delivered_count) * 100).toFixed(2)
            : 0,
        }));

        return new Response(
          JSON.stringify({
            success: true,
            data: performance,
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'workflow-performance': {
        const { data: workflows } = await supabase
          .from('workflows')
          .select('*')
          .eq('tenant_id', tenantId)
          .order('execution_count', { ascending: false });

        const performance = workflows?.map(workflow => ({
          id: workflow.id,
          name: workflow.name,
          trigger_type: workflow.trigger_type,
          status: workflow.status,
          execution_count: workflow.execution_count || 0,
          success_rate: 95,
        }));

        return new Response(
          JSON.stringify({
            success: true,
            data: performance,
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'contact-growth': {
        const { data: contacts } = await supabase
          .from('contacts')
          .select('created_at')
          .eq('tenant_id', tenantId)
          .order('created_at', { ascending: true });

        const growthData: Record<string, number> = {};
        contacts?.forEach(contact => {
          const date = new Date(contact.created_at).toISOString().split('T')[0];
          growthData[date] = (growthData[date] || 0) + 1;
        });

        let cumulative = 0;
        const growth = Object.entries(growthData)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, count]) => {
            cumulative += count;
            return { date, new_contacts: count, total_contacts: cumulative };
          });

        return new Response(
          JSON.stringify({
            success: true,
            data: growth,
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
