// import { randomInt } from "node:crypto";
import nodemailer from "nodemailer";
import { randomInt } from "node:crypto";
const sendEmail = async ({ to, subject, html, attachments } = {}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "hadeerkamel00@gmail.com",
      pass: "euhimdoyanyiprhm",
    },
  });

  const info = await transporter.sendMail({
    from: '"Deroooo" <hadeerkamel00@gmail.com>',
    to,
    subject,
    html: html || "<b>Hello world?</b>",
    attachments: attachments || [],
  });
  return info.accepted.length > 0 ? true : false;
};

export const generate_otp = async () => {
  return randomInt(100000, 1000000).toString();
};
export default sendEmail;
