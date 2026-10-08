import { Router } from "express";
import * as US from "./user.service.js";
import { authentication } from "../../common/middleware/authentication.js";
import { authorization } from "../../common/middleware/authorization.js";
import { RoleEnum } from "../../common/enum/user.enum.js";
import { validation } from "../../common/middleware/validation.js";
import { signInSchema, signUpSchema } from "./user.validation.js";
const userRouter = Router();
userRouter.post("/signup", validation(signUpSchema), US.SignUp);
userRouter.post("/signup/gmail", US.SignUpWithGoogle);
userRouter.post("/signin", validation(signInSchema), US.SignIn);
userRouter.get(
  "/profile",
  authentication,
  authorization(Object.values(RoleEnum)),
  US.getProfile,
);
export default userRouter;
