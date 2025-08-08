import mongoose, { Document, Schema, Model } from "mongoose";
import User from "./User";
import { IRFP, Version } from "interfaces";

const VersionSchema = new Schema<Version>(
  {
    filePath: { type: String, required: true },
    version: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const RFPSchema = new Schema<IRFP>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["Draft", "Published", "Under Review", "Approved", "Rejected"],
      default: "Draft",
    },
    versions: { type: [VersionSchema], default: [] },
  },
  { timestamps: true }
);

RFPSchema.index({ title: "text", description: "text" });

const RFP: Model<IRFP> =
  mongoose.models.RFP || mongoose.model<IRFP>("RFP", RFPSchema);
export default RFP;
