import { Router } from "express";
import * as US from "./user.service.js";
import { authentication } from "../../common/middleware/authentication.js";
import { authorization } from "../../common/middleware/authorization.js";
import { RoleEnum } from "../../common/enum/user.enum.js";
import { validation } from "../../common/middleware/validation.js";
import {
  refreshTokenSchema,
  signInSchema,
  signUpSchema,
  shareProfileSchema,
  updateprofileSchema,
  updatepasswordSchema,
  confirmEmailSchema,
} from "./user.validation.js";
import { multerLocal } from "../../common/middleware/multer.js";
const userRouter = Router();
userRouter.post(
  "/signup",

  multerLocal({
    customPath: "users",
    customTypes: ["image/png", "image/jpeg"],
  })
    // .array("attachments"),
    // .single("attachment"),
    .fields([
      { name: "attachment", max: 1 },
      { name: "attachments", max: 5 },
    ]),
  validation(signUpSchema),
  US.SignUp,
);
userRouter.post("/signup/gmail", US.SignUpWithGoogle);
userRouter.post("/signin", validation(signInSchema), US.SignIn);
userRouter.get(
  "/profile",
  authentication,
  authorization(Object.values(RoleEnum)),
  US.getProfile,
);

userRouter.post(
  "/refresh-token",
  validation(refreshTokenSchema),
  US.refreshToken,
);

userRouter.get(
  "/share-profile/:id",
  validation(shareProfileSchema),
  US.shareProfile,
);
userRouter.patch(
  "/update-profile",
  validation(updateprofileSchema),
  authentication,
  US.updateProfile,
);
userRouter.patch(
  "/update-password",
  validation(updatepasswordSchema),
  authentication,
  US.updatePassword,
);
userRouter.patch(
  "/confirm-email",
  validation(confirmEmailSchema),
  US.confirmEmail,
);
userRouter.patch("/logout", authentication, US.logout);
export default userRouter;
