const supabase = require('../config/database');

const findAll = async (tenantId, { page = 1, limit = 50 }) => {
  const { data, error, count } = await supabase
    .from('payments')
    .select('*', { count: 'exact' })
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
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

const findByOrderId = async (orderId, tenantId) => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('order_id', orderId)
    .eq('tenant_id', tenantId)
    .single();

  if (error) throw error;
  return data;
};

const findByPaymentId = async (paymentId, tenantId) => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('payment_id', paymentId)
    .eq('tenant_id', tenantId)
    .single();

  if (error) throw error;
  return data;
};

const create = async (paymentData, tenantId, userId) => {
  const { data, error } = await supabase
    .from('payments')
    .insert({
      tenant_id: tenantId,
      user_id: userId,
      ...paymentData
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

const updateByOrderId = async (orderId, updateData, tenantId) => {
  const { data, error } = await supabase
    .from('payments')
    .update(updateData)
    .eq('order_id', orderId)
    .eq('tenant_id', tenantId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const updateByPaymentId = async (paymentId, updateData, tenantId) => {
  const { data, error } = await supabase
    .from('payments')
    .update(updateData)
    .eq('payment_id', paymentId)
    .eq('tenant_id', tenantId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

module.exports = {
  findAll,
  findByOrderId,
  findByPaymentId,
  create,
  updateByOrderId,
  updateByPaymentId
};
