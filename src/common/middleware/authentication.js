import jwt from "jsonwebtoken";
import userModel from "../../DB/models/user.model.js";
import { findOne } from "../../DB/db.service.js";

export const authentication = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    throw new Error("token not exist", { cause: 400 });
  }
  const decoded = jwt.verify(authorization, "ahmed123");
  if (!decoded?.id) {
    // return res.status(404).json({ message: "Email not exist" });
    throw new Error("token not exist", { cause: 400 });
  }
  const user = await findOne({
    model: userModel,
    filter: { _id: decoded.id },
  });
  if (!user) {
    // return res.status(404).json({ message: "Email not exist" });
    throw new Error("Email not exist", { cause: 404 });
  }
  req.user = user;
  next();
};
