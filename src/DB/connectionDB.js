import mongoose from "mongoose";

const connectionDB = async () => {
  await mongoose
    .connect("mongodb://localhost:27017/SarahaApp", {
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
