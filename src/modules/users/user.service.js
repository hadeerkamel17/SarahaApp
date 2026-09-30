import userModel from "../../DB/models/user.model.js";
import * as dbServices from "../../DB/db.service.js";
import { Decrypt, Encrypt } from "../../common/security/encrpt.js";
import { compare, hash } from "../../common/security/hash.js";
export const SignUp = async (req, res, next) => {
  const { fName, lName, email, password, age, gender, phone } = req.body;

  const userExist = await userModel.findOne({ email: email.toLowerCase() });
  if (userExist) {
    // return res.status(404).json({ message: "email already exist" });
    throw new Error("email already exist", { cause: 400 });
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
      phone: Encrypt(phone),
    },
  });
  return res.status(201).json({ message: "Sign Up Successfully", user });
};

export const SignIn = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await dbServices.findOne({
    model: userModel,
    filter: { email: email.toLowerCase(), provider: "system" },
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

  return res.status(201).json({
    message: "SignIn Successfully",
    user: { ...user._doc, phone: Decrypt(user.phone) },
  });
};
