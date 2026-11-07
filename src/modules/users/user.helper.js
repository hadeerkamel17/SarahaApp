import {
  deleteKey,
  getValue,
  incr,
  setValue,
  ttl,
} from "../../DB/service/redis.service.js";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import * as dbServices from "../../DB/service/db.service.js";
import userModel from "../../DB/models/user.model.js";
import sendEmail, { generate_otp } from "../../common/service/sendEmail.js";
import { hashSync } from "bcrypt";
import { eventEmitter } from "../../common/utlis/events.js";
import { emailTemplate } from "../../common/utlis/email.template.js";

export const sendEmailOtp = async ({
  email,
  isConfirmed,
  subject = "confirm email",
} = {}) => {
  const isBlocked_ttl = await ttl(`otp::block::${email}`);
  if (isBlocked_ttl > 0) {
    throw new Error(
      `you blocked and you can resend otp after ${isBlocked_ttl} seconds`,
    );
  }
  // if (isBlocked_ttl < 0) {
  //   if (getValue(`otp::max::${email}`) >= 3) {
  //     await setValue({
  //       key: `otp::max::${email}`,
  //       value: 0,
  //       ttl: 60 * 5,
  //     });
  //   }
  // }
  const otpTTl = await ttl(`otp::${email}`);
  if (otpTTl > 0) {
    throw new Error(`you can resend otp after ${otpTTl} seconds`);
  }
  const max_otp = await getValue(`otp::max::${email}`);
  if (max_otp >= 3) {
    await setValue({
      key: `otp::block::${email}`,
      value: "1",
      ttl: 60 * 10,
    });
    await deleteKey(`otp::max::${email}`);

    throw new Error(
      "you have exceeded the maximum number of attempts, please try again after 10 minutes",
    );
  }
  const user = await dbServices.findOne({
    model: userModel,
    filter: { email, isConfirmed: { $exists: isConfirmed } },
  });
  if (!user) {
    // return res.status(404).json({ message: "email already exist" });
    throw new Error("user not exist or already confirmed");
  }

  const otp = await generate_otp();
  const otpHash = hashSync(otp, 12);
  await setValue({
    key: `otp::${email}`,
    value: otpHash,
    ttl: 60 * 20,
  });

  eventEmitter.emit("confirm_email", async () => {
    await sendEmail({
      to: email,
      subject,
      html: emailTemplate(otp),
    });
  });
  await incr(`otp::max::${email}`);
};

export const sendOtpByKey = async ({
  email,
  key,
  subject,
  ttlSec = 60 * 10,
} = {}) => {
  const otp = await generate_otp();
  await setValue({ key, value: hashSync(otp, 12), ttl: ttlSec });
  eventEmitter.emit("confirm_email", async () => {
    await sendEmail({ to: email, subject, html: emailTemplate(otp) });
  });
};

export const generateTokens = (user) => {
  const tokenId = randomUUID();
  const access_token = jwt.sign(
    { id: user._id, email: user.email },
    "ahmed123",
    {
      expiresIn: "1d",
      audience: "http://localhost:4000",
      issuer: "http://localhost:3000",
      jwtid: tokenId,
    },
  );
  const refresh_token = jwt.sign(
    { id: user._id, email: user.email },
    "ali123",
    { expiresIn: "1d", jwtid: tokenId },
  );
  return { access_token, refresh_token };
};
