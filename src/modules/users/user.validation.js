import joi from "joi";

export const signUpSchema = {
  body: joi
    .object({
      fName: joi.string().alphanum().min(3).max(20).required(),
      lName: joi.string().required(),
      email: joi
        .string()
        .email({ minDomainSegments: 2, maxDomainSegments: 2 })
        .required(),
      age: joi.number().min(20).max(60).required(),
      gender: joi.string().valid("male", "female").required(),
      password: joi.string().required(),
      cPassword: joi.string().valid(joi.ref("password")).required(),
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
