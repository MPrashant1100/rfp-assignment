import { Version } from "interfaces";

export interface RFP {
  _id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  versions: Version[];
}

export interface Response {
  _id: string;
  file: string;
  status: string;
  createdAt: string;
  rfp?: { title: string };
}

export interface ResponseItem {
  _id: string;
  supplier: { email: string };
  file: string;
  status: string;
  createdAt: string;
}
