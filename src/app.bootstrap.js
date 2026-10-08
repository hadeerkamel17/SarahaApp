import express from "express";
import connectionDB from "./DB/connectionDB.js";
import userRouter from "./modules/users/user.controller.js";
import cors from "cors";
const app = express();
const port = 3000;
const bootstrap = async () => {
  await connectionDB();
  app.use(cors({ origin: "*" }));
  app.use(express.json());
  app.get("/", (req, res, next) => {
    res.status(201).json({ message: "Hello on My Sarah App....😉😉" });
  });
  app.use("/users", userRouter);
  app.use("{/*demo}", (req, res, next) => {
    throw new Error(
      `URL: ${req.originalUrl} and method:${req.method} is not found`,
      { cause: 404 },
    );
  });
  app.use((err, req, res, next) => {
    console.error(err);
    res
      .status(err.cause || 500)
      .json({ message: err.message, stack: err.stack });
  });

  app.listen(port, () => {
    console.log(`server is run on port ${port}`);
  });
};

export default bootstrap;
