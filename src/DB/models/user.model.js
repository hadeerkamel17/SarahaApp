import mongoose from "mongoose";
import {
  GenderEnum,
  ProviderEnum,
  RoleEnum,
} from "../../common/enum/user.enum.js";

const userSchema = new mongoose.Schema(
  {
    fName: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 15,
    },
    lName: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 15,
    },
    email: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return this.provider == ProviderEnum.system ? true : false;
      },
      trim: true,
    },
    age: {
      type: Number,
      required: function () {
        return this.provider == ProviderEnum.system ? true : false;
      },
      min: 20,
      max: 60,
    },
    role: {
      type: String,
      enum: Object.values(RoleEnum),
      default: RoleEnum.user,
    },
    gender: {
      type: String,
      enum: Object.values(GenderEnum),
      default: GenderEnum.male,
    },
    phone: String,
    profileImage: String,
    isConfirmed: { type: Boolean, default: false },
    provider: {
      type: String,
      enum: Object.values(ProviderEnum),
      default: ProviderEnum.system,
    },
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
