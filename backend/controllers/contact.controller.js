const Contact = require('../models/Contact');

const getAll = async (req, res, next) => {
  try {
    const { page, limit, search, tags } = req.query;
    const tagArray = tags ? tags.split(',').filter(Boolean) : [];

    const result = await Contact.findAll(req.tenantId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
      search: search || '',
      tags: tagArray
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
    const contact = await Contact.findById(id, req.tenantId);

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const contact = await Contact.create(req.body, req.tenantId);

    res.status(201).json({
      success: true,
      data: contact
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contact = await Contact.update(id, req.body, req.tenantId);

    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    next(error);
  }
};

const deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Contact.delete(id, req.tenantId);

    res.json({
      success: true,
      message: 'Contact deleted successfully'
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
  delete: deleteContact
};
