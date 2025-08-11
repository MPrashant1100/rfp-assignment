import mongoose from "mongoose";

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

export type RFPStatus =
  | "Draft"
  | "Published"
  | "Under Review"
  | "Approved"
  | "Rejected";

export interface Version {
  filePath: string;
  version: number;
  uploadedAt: Date;
}

export interface IRFP extends Document {
  title: string;
  description: string;
  createdBy: mongoose.Types.ObjectId;
  status: RFPStatus;
  versions: Version[];
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = "Buyer" | "Supplier";

export interface IUser extends Document {
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
