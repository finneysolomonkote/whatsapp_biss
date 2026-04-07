import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface Contact {
  id?: string;
  tenant_id: string;
  first_name: string;
  last_name?: string;
  phone: string;
  email?: string;
  tags?: string[];
  custom_fields?: Record<string, any>;
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
    const contactId = pathParts[pathParts.length - 1];

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
        if (contactId && contactId !== 'contacts-service') {
          const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .eq('id', contactId)
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
          const search = url.searchParams.get('search') || '';
          const tags = url.searchParams.get('tags')?.split(',').filter(Boolean) || [];

          let query = supabase
            .from('contacts')
            .select('*', { count: 'exact' })
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });

          if (search) {
            query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
          }

          if (tags.length > 0) {
            query = query.contains('tags', tags);
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
        const body: Contact = await req.json();

        const { data, error } = await supabase
          .from('contacts')
          .insert({
            tenant_id: tenantId,
            first_name: body.first_name,
            last_name: body.last_name,
            phone: body.phone,
            email: body.email,
            tags: body.tags || [],
            custom_fields: body.custom_fields || {},
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
        if (!contactId || contactId === 'contacts-service') {
          return new Response(
            JSON.stringify({ error: 'Contact ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const body: Partial<Contact> = await req.json();

        const { data, error } = await supabase
          .from('contacts')
          .update({
            first_name: body.first_name,
            last_name: body.last_name,
            phone: body.phone,
            email: body.email,
            tags: body.tags,
            custom_fields: body.custom_fields,
            updated_at: new Date().toISOString(),
          })
          .eq('id', contactId)
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
        if (!contactId || contactId === 'contacts-service') {
          return new Response(
            JSON.stringify({ error: 'Contact ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error } = await supabase
          .from('contacts')
          .delete()
          .eq('id', contactId)
          .eq('tenant_id', tenantId);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, message: 'Contact deleted successfully' }),
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
