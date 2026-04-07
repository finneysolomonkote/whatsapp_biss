import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface Workflow {
  id?: string;
  tenant_id: string;
  name: string;
  description?: string;
  trigger_type: string;
  trigger_config?: Record<string, any>;
  actions: Array<Record<string, any>>;
  status: 'draft' | 'active' | 'paused';
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
    const workflowId = pathParts[pathParts.length - 1];

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
        if (workflowId && workflowId !== 'workflows-service') {
          const { data, error } = await supabase
            .from('workflows')
            .select('*')
            .eq('id', workflowId)
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
            .from('workflows')
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
        const body: Workflow = await req.json();

        const { data, error } = await supabase
          .from('workflows')
          .insert({
            tenant_id: tenantId,
            name: body.name,
            description: body.description,
            trigger_type: body.trigger_type,
            trigger_config: body.trigger_config || {},
            actions: body.actions || [],
            status: body.status || 'draft',
            execution_count: 0,
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
        if (!workflowId || workflowId === 'workflows-service') {
          return new Response(
            JSON.stringify({ error: 'Workflow ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const body: Partial<Workflow> = await req.json();

        const { data, error } = await supabase
          .from('workflows')
          .update({
            name: body.name,
            description: body.description,
            trigger_type: body.trigger_type,
            trigger_config: body.trigger_config,
            actions: body.actions,
            status: body.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', workflowId)
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
        if (!workflowId || workflowId === 'workflows-service') {
          return new Response(
            JSON.stringify({ error: 'Workflow ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error } = await supabase
          .from('workflows')
          .delete()
          .eq('id', workflowId)
          .eq('tenant_id', tenantId);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, message: 'Workflow deleted successfully' }),
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
