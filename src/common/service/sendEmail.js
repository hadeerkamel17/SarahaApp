import { randomInt } from "node:crypto";
import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "hadeerkamel00@gmail.com",
    pass: "sjdlknhfvnvyurer",
  },
});
export const sendEmail = async ({
  to,
  subject,
  html = "",
  attachments = [],
}) => {
  const info = await transporter.sendEmail({
    from: '"hadeer" <hadeerkamel00@gmail.com>',
    to,
    subject,
    html,
    attachments,
  });
  console.log(info.messageId);
  return info;
};
export const generate_otp = async () => {
  return randomInt(100000, 1000000).toString();
};
