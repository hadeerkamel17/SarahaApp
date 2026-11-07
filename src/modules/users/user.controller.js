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
  resendOtpSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
  verifyTwoStepSchema,
  confirmLoginSchema,
} from "./user.validation.js";
import { multerLocal } from "../../common/middleware/multer.js";
import messageRouter from "../message/message.controller.js";
const userRouter = Router({ strict: true, caseSensitive: true });
userRouter.use("/:userId/messages", messageRouter);

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
userRouter.post(
  "/signin/confirm",
  validation(confirmLoginSchema),
  US.confirmLogin,
);
userRouter.post("/enable-2sv", authentication, US.enableTwoStep);
userRouter.patch(
  "/verify-2sv",
  authentication,
  validation(verifyTwoStepSchema),
  US.verifyTwoStep,
);
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
userRouter.post("/resend-otp", validation(resendOtpSchema), US.reSendOtp);
userRouter.patch(
  "/forget-password",
  validation(forgetPasswordSchema),
  US.forgetPassword,
);
userRouter.patch(
  "/reset-password",
  validation(resetPasswordSchema),
  US.resetPassword,
);

userRouter.patch("/logout", authentication, US.logout);
export default userRouter;
