export const successResponse = ({
  res,
  status = 200,
  message = "Done",
  data = undefined,
} = {}) => {
  return res.status(status).json({ success: true, message, data });
};
