import messageModel from "../../DB/models/message.model.js";
import userModel from "../../DB/models/user.model.js";
import * as dbServices from "../../DB/service/db.service.js";
import { successResponse } from "../../common/utlis/response.success.js";
/*---------------------------------SignUp---------------------------------*/
export const createMessage = async (req, res, next) => {
  const { content, userId } = req.body;
  if (!content && !req.files?.length) {
    throw new Error("Content or files are required", { cause: 400 });
  }
  const userExist = await dbServices.findById({
    model: userModel,
    id: userId,
  });
  if (!userExist) {
    // return res.status(404).json({ message: "email already exist" });
    throw new Error("user does not exist", { cause: 400 });
  }
  const urls = [];
  if (req?.files?.length) {
    for (const file of req?.files) {
      urls.push(file.path);
    }
  }

  const message = await dbServices.create({
    model: messageModel,
    data: {
      content,
      attachments: urls,
      userId,
    },
  });
  return successResponse({ res, status: 201, data: { message } });
};

export const getMessages = async (req, res, next) => {
  const messages = await dbServices.find({
    model: messageModel,
    filter: {
      userId: req.user._id,
    },
  });
  return successResponse({ res, data: { messages } });
};

export const getMessageById = async (req, res, next) => {
  const message = await dbServices.findOne({
    model: messageModel,
    filter: {
      id: req.params.id,
      userId: req.user._id,
    },
  });
  return successResponse({ res, data: { message } });
};
