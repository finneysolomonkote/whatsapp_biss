const supabase = require('../config/database');

const findAll = async (tenantId, { page = 1, limit = 50, search = '', tags = [] }) => {
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
    .from('contacts')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .single();

  if (error) throw error;
  return data;
};

const create = async (contactData, tenantId) => {
  const { data, error } = await supabase
    .from('contacts')
    .insert({
      tenant_id: tenantId,
      ...contactData
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

const update = async (id, contactData, tenantId) => {
  const { data, error } = await supabase
    .from('contacts')
    .update({
      ...contactData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const deleteContact = async (id, tenantId) => {
  const { error } = await supabase
    .from('contacts')
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
  delete: deleteContact
};
