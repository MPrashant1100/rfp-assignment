import mongoose, { Document, Schema, Model } from "mongoose";
import User from "./User";

export type RFPStatus = "Draft" | "Published" | "Under Review" | "Approved" | "Rejected";

export interface IRFP extends Document {
  title: string;
  description: string;
  file: string;
  status: RFPStatus;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RFPSchema = new Schema<IRFP>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  file: { type: String, required: true },
  status: {
    type: String,
    enum: ["Draft", "Published", "Under Review", "Approved", "Rejected"],
    default: "Draft",
  },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

RFPSchema.index({ title: "text", description: "text" });

const RFP = mongoose.models.RFP || mongoose.model<IRFP>("RFP", RFPSchema);
export default RFP;