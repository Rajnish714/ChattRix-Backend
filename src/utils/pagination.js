
export async function paginate(model, filter = {}, page = 1, limit = 10, populate = "", sort = { createdAt: -1 }) {
  page = Number(page) || 1;
  limit = Number(limit) || 10;

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model.find(filter)
      .skip(skip)
      .limit(limit)
      .populate(populate)
      .sort(sort),

    model.countDocuments(filter)
  ]);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    }
  };
}
