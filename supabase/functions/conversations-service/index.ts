import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface Conversation {
  id?: string;
  tenant_id: string;
  contact_id: string;
  status: 'open' | 'closed' | 'archived';
  assigned_to?: string;
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
    const conversationId = pathParts[pathParts.length - 1];

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
        if (conversationId && conversationId !== 'conversations-service') {
          const { data, error } = await supabase
            .from('conversations')
            .select(`
              *,
              contact:contacts(*)
            `)
            .eq('id', conversationId)
            .eq('tenant_id', tenantId)
            .single();

          if (error) throw error;

          const { data: messages } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('timestamp', { ascending: true });

          return new Response(
            JSON.stringify({
              success: true,
              data: {
                ...data,
                messages: messages || [],
              },
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          const page = parseInt(url.searchParams.get('page') || '1');
          const limit = parseInt(url.searchParams.get('limit') || '50');
          const status = url.searchParams.get('status');
          const search = url.searchParams.get('search') || '';

          let query = supabase
            .from('conversations')
            .select(`
              *,
              contact:contacts(*)
            `, { count: 'exact' })
            .eq('tenant_id', tenantId)
            .order('last_message_at', { ascending: false });

          if (status) {
            query = query.eq('status', status);
          }

          const { data, error, count } = await query
            .range((page - 1) * limit, page * limit - 1);

          if (error) throw error;

          let filteredData = data;
          if (search) {
            filteredData = data?.filter((conv: any) => {
              const contactName = `${conv.contact?.first_name} ${conv.contact?.last_name || ''}`.toLowerCase();
              const phone = conv.contact?.phone?.toLowerCase() || '';
              return contactName.includes(search.toLowerCase()) || phone.includes(search.toLowerCase());
            });
          }

          return new Response(
            JSON.stringify({
              success: true,
              data: filteredData,
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
        const body: Conversation = await req.json();

        const { data, error } = await supabase
          .from('conversations')
          .insert({
            tenant_id: tenantId,
            contact_id: body.contact_id,
            status: body.status || 'open',
            assigned_to: body.assigned_to,
            last_message_at: new Date().toISOString(),
            unread_count: 0,
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
        if (!conversationId || conversationId === 'conversations-service') {
          return new Response(
            JSON.stringify({ error: 'Conversation ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const body: Partial<Conversation> = await req.json();

        const updateData: any = {
          updated_at: new Date().toISOString(),
        };

        if (body.status) updateData.status = body.status;
        if (body.assigned_to !== undefined) updateData.assigned_to = body.assigned_to;

        const { data, error } = await supabase
          .from('conversations')
          .update(updateData)
          .eq('id', conversationId)
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
        if (!conversationId || conversationId === 'conversations-service') {
          return new Response(
            JSON.stringify({ error: 'Conversation ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        await supabase
          .from('messages')
          .delete()
          .eq('conversation_id', conversationId);

        const { error } = await supabase
          .from('conversations')
          .delete()
          .eq('id', conversationId)
          .eq('tenant_id', tenantId);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, message: 'Conversation deleted successfully' }),
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
