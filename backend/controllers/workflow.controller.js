const Workflow = require('../models/Workflow');

const getAll = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query;

    const result = await Workflow.findAll(req.tenantId, {
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
    const workflow = await Workflow.findById(id, req.tenantId);

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    res.json({
      success: true,
      data: workflow
    });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const workflow = await Workflow.create(req.body, req.tenantId);

    res.status(201).json({
      success: true,
      data: workflow
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workflow = await Workflow.update(id, req.body, req.tenantId);

    res.json({
      success: true,
      data: workflow
    });
  } catch (error) {
    next(error);
  }
};

const deleteWorkflow = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Workflow.delete(id, req.tenantId);

    res.json({
      success: true,
      message: 'Workflow deleted successfully'
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
  delete: deleteWorkflow
};
