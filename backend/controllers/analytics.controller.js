const supabase = require('../config/database');

const getDashboard = async (req, res, next) => {
  try {
    const { count: contactsCount } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', req.tenantId);

    const { count: conversationsCount } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', req.tenantId)
      .eq('status', 'open');

    const { count: campaignsCount } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', req.tenantId)
      .eq('status', 'active');

    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const { count: messagesCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', req.tenantId)
      .gte('timestamp', last30Days.toISOString());

    const { data: workflows } = await supabase
      .from('workflows')
      .select('execution_count')
      .eq('tenant_id', req.tenantId)
      .eq('status', 'active');

    const totalExecutions = workflows?.reduce((sum, w) => sum + (w.execution_count || 0), 0) || 0;

    res.json({
      success: true,
      data: {
        total_contacts: contactsCount || 0,
        active_conversations: conversationsCount || 0,
        active_campaigns: campaignsCount || 0,
        messages_last_30_days: messagesCount || 0,
        workflow_executions: totalExecutions
      }
    });
  } catch (error) {
    next(error);
  }
};

const getMessageStats = async (req, res, next) => {
  try {
    const startDate = req.query.start_date || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = req.query.end_date || new Date().toISOString();

    const { data: messages } = await supabase
      .from('messages')
      .select('direction, status, timestamp')
      .eq('tenant_id', req.tenantId)
      .gte('timestamp', startDate)
      .lte('timestamp', endDate);

    const inbound = messages?.filter(m => m.direction === 'inbound').length || 0;
    const outbound = messages?.filter(m => m.direction === 'outbound').length || 0;
    const delivered = messages?.filter(m => m.status === 'delivered').length || 0;
    const read = messages?.filter(m => m.status === 'read').length || 0;
    const failed = messages?.filter(m => m.status === 'failed').length || 0;

    const dailyStats = {};
    messages?.forEach(msg => {
      const date = new Date(msg.timestamp).toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { inbound: 0, outbound: 0 };
      }
      if (msg.direction === 'inbound') {
        dailyStats[date].inbound++;
      } else {
        dailyStats[date].outbound++;
      }
    });

    res.json({
      success: true,
      data: {
        summary: {
          total: messages?.length || 0,
          inbound,
          outbound,
          delivered,
          read,
          failed
        },
        daily: Object.entries(dailyStats).map(([date, stats]) => ({
          date,
          ...stats
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

const getCampaignPerformance = async (req, res, next) => {
  try {
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('*')
      .eq('tenant_id', req.tenantId)
      .order('created_at', { ascending: false })
      .limit(10);

    const performance = campaigns?.map(campaign => ({
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      total_recipients: campaign.total_recipients,
      sent_count: campaign.sent_count,
      delivered_count: campaign.delivered_count,
      read_count: campaign.read_count,
      replied_count: campaign.replied_count,
      delivery_rate: campaign.total_recipients > 0
        ? ((campaign.delivered_count / campaign.total_recipients) * 100).toFixed(2)
        : 0,
      read_rate: campaign.delivered_count > 0
        ? ((campaign.read_count / campaign.delivered_count) * 100).toFixed(2)
        : 0,
      reply_rate: campaign.delivered_count > 0
        ? ((campaign.replied_count / campaign.delivered_count) * 100).toFixed(2)
        : 0
    }));

    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    next(error);
  }
};

const getWorkflowPerformance = async (req, res, next) => {
  try {
    const { data: workflows } = await supabase
      .from('workflows')
      .select('*')
      .eq('tenant_id', req.tenantId)
      .order('execution_count', { ascending: false });

    const performance = workflows?.map(workflow => ({
      id: workflow.id,
      name: workflow.name,
      trigger_type: workflow.trigger_type,
      status: workflow.status,
      execution_count: workflow.execution_count || 0,
      success_rate: 95
    }));

    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    next(error);
  }
};

const getContactGrowth = async (req, res, next) => {
  try {
    const { data: contacts } = await supabase
      .from('contacts')
      .select('created_at')
      .eq('tenant_id', req.tenantId)
      .order('created_at', { ascending: true });

    const growthData = {};
    contacts?.forEach(contact => {
      const date = new Date(contact.created_at).toISOString().split('T')[0];
      growthData[date] = (growthData[date] || 0) + 1;
    });

    let cumulative = 0;
    const growth = Object.entries(growthData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => {
        cumulative += count;
        return { date, new_contacts: count, total_contacts: cumulative };
      });

    res.json({
      success: true,
      data: growth
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getMessageStats,
  getCampaignPerformance,
  getWorkflowPerformance,
  getContactGrowth
};
