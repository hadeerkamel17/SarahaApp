export const authorization = (roles = []) => {
  return async (req, res, next) => {
    console.log("USER:", req.user);
    console.log("ROLE:", req.user?.role, typeof req.user?.role);
    if (!roles.includes(req.user.role)) {
      throw new Error("UnAuthorized", { cause: 401 });
    }
    next();
  };
};
