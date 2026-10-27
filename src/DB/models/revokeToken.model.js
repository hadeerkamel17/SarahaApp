import mongoose from "mongoose";

const revokeTokenSchema = new mongoose.Schema(
  {
    tokenId: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expireAt: Date,
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
  },
);
revokeTokenSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
const revokeTokenModel =
  mongoose.models.RevokeToken ||
  mongoose.model("RevokeToken", revokeTokenSchema);
export default revokeTokenModel;
