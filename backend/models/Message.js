const supabase = require('../config/database');

const findAll = async (tenantId, { conversation_id, contact_id, page = 1, limit = 100 }) => {
  let query = supabase
    .from('messages')
    .select('*', { count: 'exact' })
    .eq('tenant_id', tenantId)
    .order('timestamp', { ascending: false });

  if (conversation_id) {
    query = query.eq('conversation_id', conversation_id);
  }

  if (contact_id) {
    query = query.eq('contact_id', contact_id);
  }

  const { data, error, count } = await query
    .range((page - 1) * limit, page * limit - 1);

  if (error) throw error;

  return {
    data,
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
    .from('messages')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .single();

  if (error) throw error;
  return data;
};

const create = async (messageData, tenantId) => {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      tenant_id: tenantId,
      timestamp: new Date().toISOString(),
      ...messageData
    })
    .select()
    .single();

  if (error) throw error;

  await supabase
    .from('conversations')
    .update({
      last_message_at: new Date().toISOString(),
      last_message_preview: messageData.content.substring(0, 100)
    })
    .eq('id', messageData.conversation_id);

  return data;
};

const update = async (id, messageData, tenantId) => {
  const { data, error } = await supabase
    .from('messages')
    .update(messageData)
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const deleteMessage = async (id, tenantId) => {
  const { error } = await supabase
    .from('messages')
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
  delete: deleteMessage
};
