export const create = async ({ model, data, options }) => {
  return await model.create([data], options);
};

export const findOne = async ({ model, filter, options = {} } = {}) => {
  return await model.findOne(filter, options);
};

export const findById = async ({ model, id, options = {} } = {}) => {
  return await model.findById(id, options);
};

export const findByIdAndUdate = async ({
  model,
  id,
  update,
  options = {},
} = {}) => {
  return await model.findByIdAndUdate(id, update, { new: true, ...options });
};
