const supabase = require('../config/database');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header required' });
    }

    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

const getTenantId = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { data: tenantData, error } = await supabase
      .from('tenants')
      .select('id')
      .eq('owner_id', req.user.id)
      .single();

    if (error || !tenantData) {
      const { data: memberData } = await supabase
        .from('tenant_members')
        .select('tenant_id')
        .eq('user_id', req.user.id)
        .eq('status', 'active')
        .single();

      if (!memberData) {
        return res.status(404).json({ error: 'No tenant found for user' });
      }

      req.tenantId = memberData.tenant_id;
    } else {
      req.tenantId = tenantData.id;
    }

    next();
  } catch (error) {
    console.error('Tenant retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve tenant information' });
  }
};

module.exports = { authenticate, getTenantId };
