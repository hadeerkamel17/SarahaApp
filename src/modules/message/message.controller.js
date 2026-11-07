import { Router } from "express";
import * as MS from "./message.service.js";
import { validation } from "../../common/middleware/validation.js";
import { multerLocal } from "../../common/middleware/multer.js";
import { Multer_Enum } from "../../common/enum/multer.enum.js";
import * as MV from "./message.validation.js";
import { authentication } from "./../../common/middleware/authentication.js";
const messageRouter = Router({
  strict: true,
  caseSensitive: true,
  mergeParams: true,
});
messageRouter.post(
  "/createMessage",

  multerLocal({
    customPath: "messages",
    customTypes: Multer_Enum.images,
  }).array("attachments", 3),
  validation(MV.createMessageSchema),
  MS.createMessage,
);

messageRouter.get("/getMessages", authentication, MS.getMessages);

messageRouter.get("/getMessageById/:id", authentication, MS.getMessageById);

export default messageRouter;
