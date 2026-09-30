import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fName: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 5,
    },
    lName: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 5,
    },
    email: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
      trim: true,
    },
    password: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 20, max: 60 },
    gender: { type: String, enum: ["male", "female"], default: "male" },
    phone: String,
    profileImage: String,
    isConfirmed: { type: Boolean, default: false },
    provider: { type: String, enum: ["system", "google"], default: "system" },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    toJSON: ["virtuals"],
    toObject: ["virtuals"],
  },
);
const userModel = mongoose.models.User || mongoose.model("User", userSchema);
export default userModel;
