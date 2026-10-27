import joi from "joi";
import { generalRules } from "../../common/utlis/generalRules.js";

export const signUpSchema = {
  body: joi
    .object({
      fName: joi.string().alphanum().min(3).max(20).required(),
      lName: joi.string().required(),
      email: generalRules.email.required(),
      age: joi.number().min(20).max(60).required(),
      gender: joi.string().valid("male", "female").required(),
      phone: joi.string().required(),
      password: generalRules.password.required(),
      cPassword: joi.string().valid(joi.ref("password")).required(),
      // profileImage: joi.string().uri(),
      date: joi.date().less("now"),
    })
    .required(),
  query: joi
    .object({
      flag: joi
        .boolean()
        .falsy("false", "0", "no")
        .truthy("yes", "1", "y")
        .required(),
    })
    .required(),
  // file: generalRules.file.required(),
  // files: joi.array().items(generalRules.file.required()).required(),
  files: joi
    .object({
      attachment: joi.array().items(generalRules.file.required()).required(),
      attachments: joi.array().items(generalRules.file.required()).required(),
    })
    .required(),
};
export const signInSchema = {
  body: joi
    .object({
      email: joi
        .string()
        .email({ minDomainSegments: 2, maxDomainSegments: 2 })
        .required(),
      password: joi.string().required(),
    })
    .required(),
};
export const refreshTokenSchema = {
  headers: generalRules.token.required(),
};

export const shareProfileSchema = {
  params: joi
    .object({
      id: generalRules.id.required(),
    })
    .required(),
};

export const updateprofileSchema = {
  body: joi
    .object({
      fName: joi.string().alphanum().min(3).max(20),
      lName: joi.string(),
      age: joi.number().min(20).max(60),
      gender: joi.string().valid("male", "female"),
      phone: joi.string(),
    })
    .required(),
};
export const updatepasswordSchema = {
  body: joi
    .object({
      oldPassword: generalRules.password.required(),
      newPassword: generalRules.password.required(),
      cPassword: joi.string().valid(joi.ref("newPassword")).required(),
    })
    .required(),
};
