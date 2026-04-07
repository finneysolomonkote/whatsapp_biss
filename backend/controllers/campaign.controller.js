const Campaign = require('../models/Campaign');

const getAll = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query;

    const result = await Campaign.findAll(req.tenantId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
      status
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findById(id, req.tenantId);

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json({
      success: true,
      data: campaign
    });
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const stats = await Campaign.getStats(id, req.tenantId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const campaign = await Campaign.create(req.body, req.tenantId);

    res.status(201).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.update(id, req.body, req.tenantId);

    res.json({
      success: true,
      data: campaign
    });
  } catch (error) {
    next(error);
  }
};

const deleteCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Campaign.delete(id, req.tenantId);

    res.json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  getStats,
  create,
  update,
  delete: deleteCampaign
};
