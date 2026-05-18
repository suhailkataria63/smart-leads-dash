import { Schema, Types, model, type HydratedDocument } from "mongoose";

enum LeadStatus {
  New = "New",
  Contacted = "Contacted",
  Qualified = "Qualified",
  Lost = "Lost",
}

enum LeadSource {
  Website = "Website",
  Instagram = "Instagram",
  Referral = "Referral",
}

interface ILead {
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  createdBy: Types.ObjectId;
  createdAt: Date;
}

type LeadDocument = HydratedDocument<ILead>;

const leadSchema = new Schema<ILead>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(LeadStatus),
      default: LeadStatus.New,
      required: true,
    },
    source: {
      type: String,
      enum: Object.values(LeadSource),
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

const Lead = model<ILead>("Lead", leadSchema);

export { Lead, LeadSource, LeadStatus };
export type { ILead, LeadDocument };
