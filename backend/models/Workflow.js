const supabase = require('../config/database');

const findAll = async (tenantId, { page = 1, limit = 50, status }) => {
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
    .from('workflows')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .single();

  if (error) throw error;
  return data;
};

const create = async (workflowData, tenantId) => {
  const { data, error } = await supabase
    .from('workflows')
    .insert({
      tenant_id: tenantId,
      execution_count: 0,
      ...workflowData
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

const update = async (id, workflowData, tenantId) => {
  const { data, error } = await supabase
    .from('workflows')
    .update({
      ...workflowData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const deleteWorkflow = async (id, tenantId) => {
  const { error } = await supabase
    .from('workflows')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenantId);

  if (error) throw error;
  return true;
};

const incrementExecutionCount = async (id, tenantId) => {
  const workflow = await findById(id, tenantId);

  const { error } = await supabase
    .from('workflows')
    .update({
      execution_count: (workflow.execution_count || 0) + 1
    })
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
  delete: deleteWorkflow,
  incrementExecutionCount
};
