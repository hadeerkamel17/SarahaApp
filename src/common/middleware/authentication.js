import jwt from "jsonwebtoken";
import userModel from "../../DB/models/user.model.js";
import { findOne } from "../../DB/service/db.service.js";
import { ttl } from "../../DB/service/redis.service.js";
// import revokeTokenModel from "../../DB/models/revokeToken.model.js";

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
  if (user?.changeCradentialAt?.getTime() > decoded.iat * 1000) {
    throw new Error("token expired you should sign in again", { cause: 401 });
  }

  if ((await ttl(`revoke_token::${user._id}::${decoded.jti}`)) > 0) {
    throw new Error("token revoked you should sign in again");
  }
  // if (
  //   await findOne({
  //     model: revokeTokenModel,
  //     filter: { tokenId: decoded.jti },
  //   })
  // ) {
  //   throw new Error("token revoked you should sign in again", { cause: 401 });
  // }
  req.user = user;
  req.decoded = decoded;
  next();
};
