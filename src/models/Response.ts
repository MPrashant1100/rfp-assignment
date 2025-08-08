import mongoose, { Document, Schema, Model } from "mongoose";
import User from "./User";
import RFP from "./RFP";
import { IResponse } from "interfaces";


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
