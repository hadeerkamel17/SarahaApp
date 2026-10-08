import userModel from "../../DB/models/user.model.js";
import * as dbServices from "../../DB/db.service.js";
import { Decrypt, Encrypt } from "../../common/security/encrpt.js";
import { compare, hash } from "../../common/security/hash.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { ProviderEnum } from "../../common/enum/user.enum.js";
import { validation } from "../../common/middleware/validation.js";
const client = new OAuth2Client();

export const SignUp = async (req, res, next) => {
  // const { fName, lName, email, password, age, gender, phone } = req.body;

  // const userExist = await userModel.findOne({ email: email.toLowerCase() });
  // if (userExist) {
  //   // return res.status(404).json({ message: "email already exist" });
  //   throw new Error("email already exist", { cause: 400 });
  // }
  // const user = await dbServices.create({
  //   model: userModel,
  //   data: {
  //     fName,
  //     lName,
  //     email,
  //     password: await hash(password),
  //     age,
  //     gender,
  //     phone: Encrypt(phone),
  //   },
  // });
  return res.status(201).json({ message: "Done" });
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
  const access_token = jwt.sign(
    { id: user._id, email: user.email },
    "ahmed123",
    {
      expiresIn: 60 * 5,
      audience: "http://localhost:4000",
      issuer: "http://localhost:3000",
      notBefore: 30,
      noTimestamp: true,
    },
  );
  const refresh_token = jwt.sign({ id: user._id, email: user.email }, "ali123");

  return res.status(201).json({
    message: "SignIn Successfully",
    tokens: { access_token, refresh_token },
    user: { ...user._doc, phone: Decrypt(user.phone) },
  });
};

export const getProfile = async (req, res, next) => {
  return res.status(200).json({ message: "done", user: req.user });
};
