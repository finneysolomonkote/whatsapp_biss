const Message = require('../models/Message');

const getAll = async (req, res, next) => {
  try {
    const { conversation_id, contact_id, page, limit } = req.query;

    const result = await Message.findAll(req.tenantId, {
      conversation_id,
      contact_id,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 100
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
    const message = await Message.findById(id, req.tenantId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const message = await Message.create(req.body, req.tenantId);

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const message = await Message.update(id, req.body, req.tenantId);

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    next(error);
  }
};

const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Message.delete(id, req.tenantId);

    res.json({
      success: true,
      message: 'Message deleted successfully'
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
  delete: deleteMessage
};
