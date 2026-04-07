import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface Message {
  id?: string;
  conversation_id: string;
  contact_id: string;
  content: string;
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp?: string;
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
    const messageId = pathParts[pathParts.length - 1];

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
        const conversationId = url.searchParams.get('conversation_id');
        const contactId = url.searchParams.get('contact_id');
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '100');

        if (messageId && messageId !== 'messages-service') {
          const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('id', messageId)
            .eq('tenant_id', tenantId)
            .single();

          if (error) throw error;

          return new Response(
            JSON.stringify({ success: true, data }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        let query = supabase
          .from('messages')
          .select('*', { count: 'exact' })
          .eq('tenant_id', tenantId)
          .order('timestamp', { ascending: false });

        if (conversationId) {
          query = query.eq('conversation_id', conversationId);
        }

        if (contactId) {
          query = query.eq('contact_id', contactId);
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

      case 'POST': {
        const body: Message = await req.json();

        const { data, error } = await supabase
          .from('messages')
          .insert({
            tenant_id: tenantId,
            conversation_id: body.conversation_id,
            contact_id: body.contact_id,
            content: body.content,
            direction: body.direction,
            status: body.status || 'sent',
            timestamp: body.timestamp || new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;

        await supabase
          .from('conversations')
          .update({
            last_message_at: new Date().toISOString(),
            last_message_preview: body.content.substring(0, 100),
          })
          .eq('id', body.conversation_id);

        return new Response(
          JSON.stringify({ success: true, data }),
          { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'PUT': {
        if (!messageId || messageId === 'messages-service') {
          return new Response(
            JSON.stringify({ error: 'Message ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const body: Partial<Message> = await req.json();

        const { data, error } = await supabase
          .from('messages')
          .update({
            status: body.status,
          })
          .eq('id', messageId)
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
        if (!messageId || messageId === 'messages-service') {
          return new Response(
            JSON.stringify({ error: 'Message ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error } = await supabase
          .from('messages')
          .delete()
          .eq('id', messageId)
          .eq('tenant_id', tenantId);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, message: 'Message deleted successfully' }),
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
