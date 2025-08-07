import mongoose, { Document, Schema, Model } from "mongoose";
import User from "./User";
import RFP from "./RFP";

export type ResponseStatus =
  | "Submitted"
  | "Under Review"
  | "Approved"
  | "Rejected";

export interface IResponse extends Document {
  rfp: mongoose.Types.ObjectId;
  supplier: mongoose.Types.ObjectId;
  file: string;
  status: ResponseStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ResponseSchema = new Schema<IResponse>(
  {
    rfp: { type: Schema.Types.ObjectId, ref: "RFP", required: true },
    supplier: { type: Schema.Types.ObjectId, ref: "User", required: true },
    file: { type: String, required: true },
    status: {
      type: String,
      enum: ["Submitted", "Under Review", "Approved", "Rejected"],
      default: "Submitted",
    },
  },
  { timestamps: true }
);

ResponseSchema.index({ file: "text" });

export default (mongoose.models.Response as Model<IResponse>) ||
  mongoose.model<IResponse>("Response", ResponseSchema);
