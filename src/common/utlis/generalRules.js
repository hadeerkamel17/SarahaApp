import joi from "joi";
import { Types } from "mongoose";

export const generalRules = {
  id: joi.string().custom((value, helper) => {
    return Types.ObjectId.isValid(value)
      ? value
      : helper.message("Invalid id format");
  }),
  email: joi.string().email({ minDomainSegments: 2, maxDomainSegments: 2 }),
  password: joi.string(),
  file: joi.object({
    fieldname: joi.string().required(),
    originalname: joi.string().required(),
    encoding: joi.string().required(),
    mimetype: joi.string().required(),
    path: joi.string(),
    destination: joi.string(),
    filename: joi.string(),
    size: joi.number().required(),
  }),
  token: joi.object({
    authorization: joi.string().required(),
    "cache-control": joi.string().required(),
    "postman-token": joi.string().required(),
    "content-length": joi.string().required(),
    host: joi.string().required(),
    "user-agent": joi.string().required(),
    accept: joi.string().required(),
    "accept-encoding": joi.string().required(),
    connection: joi.string().required(),
  }),
};
