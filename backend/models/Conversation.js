const supabase = require('../config/database');

const findAll = async (tenantId, { page = 1, limit = 50, status, search = '' }) => {
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
    filteredData = data?.filter((conv) => {
      const contactName = `${conv.contact?.first_name} ${conv.contact?.last_name || ''}`.toLowerCase();
      const phone = conv.contact?.phone?.toLowerCase() || '';
      return contactName.includes(search.toLowerCase()) || phone.includes(search.toLowerCase());
    });
  }

  return {
    data: filteredData,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil((count || 0) / limit)
    }
  };
};

const findById = async (id, tenantId) => {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      contact:contacts(*)
    `)
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .single();

  if (error) throw error;

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', id)
    .order('timestamp', { ascending: true });

  return {
    ...data,
    messages: messages || []
  };
};

const create = async (conversationData, tenantId) => {
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      tenant_id: tenantId,
      last_message_at: new Date().toISOString(),
      unread_count: 0,
      ...conversationData
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

const update = async (id, conversationData, tenantId) => {
  const { data, error } = await supabase
    .from('conversations')
    .update({
      ...conversationData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const deleteConversation = async (id, tenantId) => {
  await supabase
    .from('messages')
    .delete()
    .eq('conversation_id', id);

  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenantId);

  if (error) throw error;
  return true;
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  delete: deleteConversation
};
