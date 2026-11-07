import express from "express";
import connectionDB from "./DB/connectionDB.js";
import userRouter from "./modules/users/user.controller.js";
import cors from "cors";
import connectionRedis from "./DB/connection.redis.js";
import messageRouter from "./modules/message/message.controller.js";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import { PORT } from "../config/config.service.js";
const app = express();
const port = PORT;
const allowedOrigin = [
  "http://localhost:3000",
  "http://localhost:4000",
  undefined,
];
const bootstrap = async () => {
  app.set("case sensitive routing", true);
  app.set("strict routing", true);
  await connectionDB();
  await connectionRedis();
  app.use(
    cors({
      origin: function (origin, callback) {
        if (allowedOrigin.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
    }),
  );
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 5,
    message: {
      success: false,
      message:
        "Too many requests from this IP, please try again after a minute",
    },
    statusCode: 400,
    standardHeaders: true,
    legacyHeaders: false,
    // skip: (req) => req.path == "/messages",
    // skipSuccessfulRequests: true,
    handler: (req, res) => {
      res.status(400).json({
        message:
          "Too many requests from this IP, please try again after a minute",
      });
    },
  });
  app.use(limiter);
  app.use(helmet());
  app.use(express.json());
  app.get("/", (req, res, next) => {
    res.status(201).json({ message: "Hello on My Sarah App....😉😉" });
  });
  app.use("/users", userRouter);
  app.use("/messages", messageRouter);

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
