import mongoose from "mongoose";
import { DB_URI } from "../../config/config.service.js";

const connectionDB = async () => {
  await mongoose
    .connect(DB_URI, {
      serverSelectionTimeoutMs: 5000,
    })
    .then(() => {
      console.log("DB Connected Successfully ...😉 😉 😉 😉");
    })
    .catch((err) => {
      console.log("DB Connected Failed ...😒 😒 😒 😒");
    });
};

export default connectionDB;
