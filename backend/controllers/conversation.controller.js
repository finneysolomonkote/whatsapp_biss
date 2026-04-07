const Conversation = require('../models/Conversation');

const getAll = async (req, res, next) => {
  try {
    const { page, limit, status, search } = req.query;

    const result = await Conversation.findAll(req.tenantId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
      status,
      search: search || ''
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
    const conversation = await Conversation.findById(id, req.tenantId);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const conversation = await Conversation.create(req.body, req.tenantId);

    res.status(201).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.update(id, req.body, req.tenantId);

    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

const deleteConversation = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Conversation.delete(id, req.tenantId);

    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: deleteConversation
};
