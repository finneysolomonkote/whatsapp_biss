const getPaginationParams = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 50, 100);
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

const createPaginationResponse = (page, limit, total) => {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPreviousPage: page > 1
  };
};

module.exports = {
  getPaginationParams,
  createPaginationResponse
};
