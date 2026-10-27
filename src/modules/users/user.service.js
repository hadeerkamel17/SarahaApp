import userModel from "../../DB/models/user.model.js";
import * as dbServices from "../../DB/db.service.js";
import { Decrypt, Encrypt } from "../../common/security/encrpt.js";
import { compare, hash } from "../../common/security/hash.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { ProviderEnum } from "../../common/enum/user.enum.js";
import { validation } from "../../common/middleware/validation.js";
import { hashSync } from "bcrypt";
import { generate_otp } from "../../common/service/sendEmail.js";
import { randomUUID } from "node:crypto";
import revokeTokenModel from "../../DB/models/revokeToken.model.js";
const client = new OAuth2Client();

export const SignUp = async (req, res, next) => {
  console.log(req.files);
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
    },
  });
  return res.status(201).json({ message: "Done", user });
};

export const SignUpWithGoogle = async (req, res, next) => {
  const { idToken } = req.body;

  console.log(idToken);

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
      "ahmed123",
      {
        expiresIn: 60 * 5,
      },
    );
    const refresh_token = jwt.sign(
      { id: user._id, email: user.email },
      "ali123",
    );
    return res.status(201).json({
      message: "done",
      tokens: { access_token, refresh_token },
    });
  }
};

export const SignIn = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await dbServices.findOne({
    model: userModel,
    filter: { email: email.toLowerCase(), provider: ProviderEnum.system },
  });
  if (!user) {
    // return res.status(404).json({ message: "Email not exist" });
    throw new Error("Email not exist");
  }
  if (!(await compare(password, user.password))) {
    // return res.status(400).json({ message: "Invalid Password" });
    throw new Error("Invalid Password", { cause: 400 });
  }
  // if (user.isConfirmed !== true) {
  //   return res.status(400).json({ message: "email not conirmed" });
  // }
  const tokenId = randomUUID();
  const access_token = jwt.sign(
    { id: user._id, email: user.email },
    "ahmed123",
    {
      expiresIn: 60 * 5,
      audience: "http://localhost:4000",
      issuer: "http://localhost:3000",
      jwtid: tokenId,
      // notBefore: 30,
      // noTimestamp: true,
    },
  );
  const refresh_token = jwt.sign(
    { id: user._id, email: user.email },
    "ali123",
    { expiresIn: 60 * 60, jwtid: tokenId },
  );

  return res.status(201).json({
    message: "SignIn Successfully",
    tokens: { access_token, refresh_token },
    user: { ...user._doc, phone: Decrypt(user.phone) },
  });
};

export const getProfile = async (req, res, next) => {
  return res.status(200).json({ message: "done", user: req.user });
};

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
    "ahmed123",
    {
      expiresIn: 60 * 5,
    },
  );
  return res.status(200).json({ message: "done", access_token });
};
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
  return res.status(200).json({ message: "done", user });
};

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

  return res.status(200).json({ message: "done", user: req.user });
};

export const updatePassword = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  if (!(await compare(oldPassword, req.user.password))) {
    throw new Error("Invalid old password", { cause: 400 });
  }
  req.user.password = await hash(newPassword);
  req.user.changeCradentialAt = new Date();
  req.user.phone = Decrypt(req.user.phone);

  await req.user.save();
  return res.status(200).json({ message: "done", user: req.user });
};

export const logout = async (req, res, next) => {
  const { flag } = req.query;
  if (flag == "all") {
    req.user.changeCradentialAt = new Date();
    await req.user.save();
  } else {
    await dbServices.create({
      model: revokeTokenModel,
      data: {
        userId: req.user._id,
        tokenId: req.decoded.jti,
        expireAt: new Date(req.decoded.exp * 1000), // Set the expiration time to 1 hour from now
      },
    });
  }
  req.user.phone = Decrypt(req.user.phone);

  return res.status(200).json({ message: "done" });
};
