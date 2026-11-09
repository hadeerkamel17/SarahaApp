import multer from "multer";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import { resolve } from "node:path";
export const multerLocal = ({ customPath = "general", customTypes = [] }) => {
  const fullPath = `uploads/${customPath}`;
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, fullPath);
    },
    filename: (req, file, cb) => {
      cb(null, randomUUID() + "__" + file.originalname);
    },
  });

  function fileFilter(req, file, cb) {
    if (!customTypes.includes(file.mimetype)) {
      cb(new Error("Invalid file!"));
    } else {
      cb(null, true);
    }
  }
  const upload = multer({ storage, fileFilter });

  // const storage = multer.memoryStorage();
  // const upload = multer({ storage });
  return upload;
};
