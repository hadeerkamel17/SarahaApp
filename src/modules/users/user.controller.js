import { Router } from "express";
import * as US from "./user.service.js";
const userRouter = Router();
userRouter.post("/signup", US.SignUp);
userRouter.post("/signin", US.SignIn);

export default userRouter;
