const supabase = require('../config/database');

const findAll = async (tenantId, { page = 1, limit = 50, status }) => {
  let query = supabase
    .from('campaigns')
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
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .single();

  if (error) throw error;
  return data;
};

const create = async (campaignData, tenantId) => {
  const { data: contacts } = await supabase
    .from('contacts')
    .select('id', { count: 'exact' })
    .eq('tenant_id', tenantId);

  const totalRecipients = contacts?.length || 0;

  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      tenant_id: tenantId,
      total_recipients: totalRecipients,
      sent_count: 0,
      delivered_count: 0,
      read_count: 0,
      replied_count: 0,
      failed_count: 0,
      ...campaignData
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

const update = async (id, campaignData, tenantId) => {
  const { data, error } = await supabase
    .from('campaigns')
    .update({
      ...campaignData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const deleteCampaign = async (id, tenantId) => {
  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenantId);

  if (error) throw error;
  return true;
};

const getStats = async (id, tenantId) => {
  const campaign = await findById(id, tenantId);

  return {
    total_recipients: campaign.total_recipients,
    sent_count: campaign.sent_count,
    delivered_count: campaign.delivered_count,
    read_count: campaign.read_count,
    replied_count: campaign.replied_count,
    failed_count: campaign.failed_count,
    delivery_rate: campaign.total_recipients > 0
      ? ((campaign.delivered_count / campaign.total_recipients) * 100).toFixed(2)
      : 0,
    read_rate: campaign.delivered_count > 0
      ? ((campaign.read_count / campaign.delivered_count) * 100).toFixed(2)
      : 0
  };
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  delete: deleteCampaign,
  getStats
};
