import userModel from "../../DB/models/user.model.js";
import * as dbServices from "../../DB/service/db.service.js";
import { Decrypt, Encrypt } from "../../common/security/encrpt.js";
import { compare, hash } from "../../common/security/hash.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { ProviderEnum } from "../../common/enum/user.enum.js";
import { validation } from "../../common/middleware/validation.js";
import { compareSync, hashSync } from "bcrypt";
import sendEmail, { generate_otp } from "../../common/service/sendEmail.js";
import { randomUUID } from "node:crypto";
import {
  deleteKey,
  getValue,
  incr,
  keys,
  setValue,
  ttl,
} from "../../DB/service/redis.service.js";
import { eventEmitter } from "../../common/utlis/events.js";
import { emailTemplate } from "../../common/utlis/email.template.js";
import { generateTokens, sendEmailOtp, sendOtpByKey } from "./user.helper.js";
import { successResponse } from "../../common/utlis/response.success.js";
import {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} from "../../../config/config.service.js";
const client = new OAuth2Client();
/*---------------------------------SignUp---------------------------------*/
export const SignUp = async (req, res, next) => {
  const { fName, lName, email, password, age, gender, phone } = req.body;
  const userExist = await userModel.findOne({ email: email.toLowerCase() });
  if (userExist) {
    // return res.status(404).json({ message: "email already exist" });
    throw new Error("email already exist", { cause: 400 });
  }
  const paths = [];
  for (const file of req.files.attachments) {
    paths.push(file.path);
  }

  const otp = await generate_otp();
  const otpHash = hashSync(otp, 12);
  await setValue({
    key: `otp::${email}`,
    value: otpHash,
    ttl: 60 * 20,
  });

  await setValue({
    key: `otp::max::${email}`,
    value: 1,
    ttl: 60 * 5,
  });

  eventEmitter.emit("confirm_email", async () => {
    await sendEmail({
      to: email,
      subject: "confirm email",
      html: emailTemplate(otp),
    });
  });

  const user = await dbServices.create({
    model: userModel,
    data: {
      fName,
      lName,
      email,
      password: await hash(password),
      age,
      gender,
      phone: phone ? Encrypt(phone) : undefined,
      profileImage: req.files.attachment[0].path,
      coverImages: paths,
      isConfirmed: false,
    },
  });
  return successResponse({ res, status: 201, data: { user } });
};
/*---------------------------------reSendOtp---------------------------------*/

export const reSendOtp = async (req, res, next) => {
  const { email } = req.body;
  await sendEmailOtp({ email, isConfirmed: false });
  return successResponse({ res, status: 201 });
};
/*---------------------------------SignUpWithGoogle---------------------------------*/

export const SignUpWithGoogle = async (req, res, next) => {
  const { idToken } = req.body;

  const decoded = await client.verifyIdToken({
    idToken,
    audience:
      "574224997217-jm7f5plj7lme3tlk5demo27eablcmkd2.apps.googleusercontent.com",
  });
  const { given_name, family_name, picture, email, email_verified } =
    decoded.getPayload();

  let user = await userModel.findOne({ email: email.toLowerCase() });
  if (!user) {
    user = await userModel.create({
      fName: given_name,
      lName: family_name,
      email: email.toLowerCase(),
      profileImage: picture,
      isConfirmed: email_verified,
      provider: ProviderEnum.google,
    });
    if (user.provider == ProviderEnum.system) {
      throw new Error("please login with system", { cause: 400 });
    }

    const access_token = jwt.sign(
      { id: user._id, email: user.email },
      ACCESS_TOKEN_SECRET,
      {
        expiresIn: 60 * 5,
      },
    );
    const refresh_token = jwt.sign(
      { id: user._id, email: user.email },
      REFRESH_TOKEN_SECRET,
      {
        expiresIn: 60 * 60 * 24 * 7, // 1 week
      },
    );
    return successResponse({
      res,
      status: 201,
      data: { tokens: { access_token, refresh_token } },
    });
  }
};
/*---------------------------------confirmEmail---------------------------------*/

export const confirmEmail = async (req, res, next) => {
  const { email, otp } = req.body;
  const otpValue = await getValue(`otp::${email}`);
  if (!otpValue) {
    throw new Error("otp expire", { cause: 400 });
  }

  if (!compareSync(otp, otpValue)) {
    throw new Error("invalid otp", { cause: 400 });
  }
  const user = await dbServices.findOneAndUpdate({
    model: userModel,
    filter: {
      email,
      isConfirmed: { $exists: false },
    },
    update: {
      isConfirmed: { $exists: true },
    },
  });
  if (!user) {
    // return res.status(404).json({ message: "Email not exist" });
    throw new Error("User not exist or already confirmed", { cause: 400 });
  }
  await deleteKey(`otp::${email}`);
  return successResponse({ res, data: { user } });
};
/*---------------------------------SignIn---------------------------------*/

export const SignIn = async (req, res, next) => {
  const { email, password } = req.body;
  const lowerEmail = email.toLowerCase();

  const banTTL = await ttl(`login::ban::${lowerEmail}`);
  if (banTTL > 0) {
    throw new Error(
      `account temporarily banned, try again after ${banTTL} seconds`,
      { cause: 403 },
    );
  }

  const user = await dbServices.findOne({
    model: userModel,
    filter: {
      email: lowerEmail,
      provider: ProviderEnum.system,
      isConfirmed: { $exists: true },
    },
  });
  if (!user) {
    throw new Error("Email not exist", { cause: 404 });
  }

  if (!(await compare(password, user.password))) {
    const failCount = await incr(`login::fail::${lowerEmail}`);
    if (failCount >= 5) {
      await setValue({
        key: `login::ban::${lowerEmail}`,
        value: "1",
        ttl: 60 * 5,
      });
      await deleteKey(`login::fail::${lowerEmail}`);
      throw new Error("5 failed attempts, account banned for 5 minutes", {
        cause: 403,
      });
    }
    throw new Error(`Invalid Password, ${5 - failCount} attempts left`, {
      cause: 400,
    });
  }

  await deleteKey(`login::fail::${lowerEmail}`);

  if (user.twoStepVerification) {
    await sendOtpByKey({
      email: lowerEmail,
      key: `otp::login::${lowerEmail}`,
      subject: "login verification code",
    });
    return successResponse({
      res,
      message: "OTP sent to your email, confirm login to get your tokens",
    });
  }

  return successResponse({
    res,
    status: 201,
    message: "SignIn Successfully",
    data: {
      tokens: generateTokens(user),
      user: {
        ...user._doc,
        phone: user.phone ? Decrypt(user.phone) : undefined,
      },
    },
  });
};

/*---------------------------------confirmLogin---------------------------------*/
export const confirmLogin = async (req, res, next) => {
  const { email, otp } = req.body;
  const lowerEmail = email.toLowerCase();
  const otpHash = await getValue(`otp::login::${lowerEmail}`);
  if (!otpHash) throw new Error("otp expired", { cause: 400 });
  if (!compareSync(otp, otpHash))
    throw new Error("invalid otp", { cause: 400 });

  const user = await dbServices.findOne({
    model: userModel,
    filter: { email: lowerEmail, provider: ProviderEnum.system },
  });
  if (!user) throw new Error("Email not exist", { cause: 404 });

  await deleteKey(`otp::login::${lowerEmail}`);
  return successResponse({
    res,
    status: 201,
    message: "SignIn Successfully",
    data: {
      tokens: generateTokens(user),
      user: {
        ...user._doc,
        phone: user.phone ? Decrypt(user.phone) : undefined,
      },
    },
  });
};

/*---------------------------------enableTwoStep---------------------------------*/
export const enableTwoStep = async (req, res, next) => {
  if (req.user.twoStepVerification) {
    throw new Error("2-step-verification already enabled", { cause: 400 });
  }
  await sendOtpByKey({
    email: req.user.email,
    key: `otp::2sv::${req.user.email}`,
    subject: "enable 2-step-verification",
  });
  return successResponse({
    res,
    message: "OTP sent to your email to enable 2-step-verification",
  });
};

/*---------------------------------verifyTwoStep---------------------------------*/
export const verifyTwoStep = async (req, res, next) => {
  const { otp } = req.body;
  const otpHash = await getValue(`otp::2sv::${req.user.email}`);
  if (!otpHash) throw new Error("otp expired", { cause: 400 });
  if (!compareSync(otp, otpHash))
    throw new Error("invalid otp", { cause: 400 });

  req.user.twoStepVerification = true;
  await req.user.save();
  await deleteKey(`otp::2sv::${req.user.email}`);
  return successResponse({
    res,
    message: "2-step-verification enabled successfully",
  });
};
/*---------------------------------getProfile---------------------------------*/

export const getProfile = async (req, res, next) => {
  return successResponse({ res, data: { user: req.user } });
};
/*---------------------------------refreshToken---------------------------------*/

export const refreshToken = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    throw new Error("in-valid refresh token", { cause: 400 });
  }

  const decoded = jwt.verify(authorization, "ali123");
  if (!decoded?.id) {
    // return res.status(404).json({ message: "Email not exist" });
    throw new Error("token not exist", { cause: 400 });
  }
  const user = await dbServices.findOne({
    model: userModel,
    filter: { _id: decoded.id },
  });
  if (!user) {
    // return res.status(404).json({ message: "Email not exist" });
    throw new Error("Email not exist", { cause: 404 });
  }

  const access_token = jwt.sign(
    { id: user._id, email: user.email },
    ACCESS_TOKEN_SECRET,
    {
      expiresIn: 60 * 5,
    },
  );
  return successResponse({ res, data: { access_token } });
};
/*---------------------------------shareProfile---------------------------------*/

export const shareProfile = async (req, res, next) => {
  const { id } = req.params;
  let user = await dbServices.findById({
    model: userModel,
    id,
    options: { password: 0 },
  });
  if (!user) {
    throw new Error("user not found", { cause: 404 });
  }
  user.phone = Decrypt(user.phone);
  return successResponse({ res, data: { user } });
};
/*---------------------------------updateProfile---------------------------------*/

export const updateProfile = async (req, res, next) => {
  const { fName, lName, age, gender, phone } = req.body;
  let updateQuery = {};
  if (fName !== undefined) {
    updateQuery.fName = fName;
  }
  if (lName !== undefined) {
    updateQuery.lName = lName;
  }
  if (age !== undefined) {
    updateQuery.age = age;
  }
  if (gender !== undefined) {
    updateQuery.gender = gender;
  }
  if (phone !== undefined) {
    updateQuery.phone = Encrypt(phone);
  }
  let user = await dbServices.findByIdAndUpdate({
    model: userModel,
    id: req.user._id,
    update: updateQuery,
  });
  req.user.phone = Decrypt(req.user.phone);

  return successResponse({ res, data: { user: req.user } });
};
/*---------------------------------updatePassword---------------------------------*/

export const updatePassword = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  if (!(await compare(oldPassword, req.user.password))) {
    throw new Error("Invalid old password", { cause: 400 });
  }
  req.user.password = await hash(newPassword);
  req.user.changeCradentialAt = new Date();
  req.user.phone = Decrypt(req.user.phone);

  await req.user.save();
  return successResponse({ res, data: { user: req.user } });
};
/*---------------------------------logout---------------------------------*/

export const logout = async (req, res, next) => {
  const { flag } = req.query;
  if (flag == "all") {
    req.user.changeCradentialAt = new Date();
    await req.user.save();
    await deleteKey(await keys(`revoke_token::${req.user._id}`));
  } else {
    console.log(req.decoded.exp - Math.floor(Date.now() / 1000));
    await setValue({
      key: `revoke_token::${req.user._id}::${req.decoded.jti}`,
      value: `${req.decoded.jti}`,
      ttl: req.decoded.exp - Math.floor(Date.now() / 1000),
    });
    // await dbServices.create({
    //   model: revokeTokenModel,
    //   data: {
    //     userId: req.user._id,
    //     tokenId: req.decoded.jti,
    //     expireAt: new Date(req.decoded.exp * 1000), // Set the expiration time to 1 hour from now
    //   },
    // });
  }
  req.user.phone = Decrypt(req.user.phone);

  return successResponse({ res, message: "logged out" });
};

export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;
  await sendEmailOtp({ email, isConfirmed: true });
  return successResponse({ res, status: 201 });
};

export const resetPassword = async (req, res, next) => {
  const { email, code, password } = req.body;
  const otp = await getValue(`otp::${email}`);
  if (!otp) {
    throw new Error("otp expire", { cause: 400 });
  }
  if (!compareSync(code, otp)) {
    throw new Error("invalid otp", { cause: 400 });
  }
  const user = await dbServices.findOneAndUpdate({
    model: userModel,
    filter: { email, isConfirmed: { $exists: true } },
    update: {
      password: hashSync(password, 12),
      changeCradentialAt: new Date(),
    },
  });
  if (!user) {
    throw new Error("user not exist", { cause: 400 });
  }
  await deleteKey(`otp::${email}`);
  return successResponse({ res, status: 201 });
};
