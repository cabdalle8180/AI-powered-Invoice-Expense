import mongoose, { Document, Schema, Types } from "mongoose";

export interface IBusiness extends Document {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  currency: string;
  taxNumber?: string;
  logo?: {
    url: string;
    public_id?: string;
  };
  ownerId: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const businessSchema = new Schema<IBusiness>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    currency: {
      type: String,
      default: "USD",
      uppercase: true,
      trim: true,
    },

    taxNumber: {
      type: String,
      trim: true,
    },

    logo: {
      url: {
        type: String,
        trim: true,
      },
      public_id: {
        type: String,
        trim: true,
      },
    },

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Business = mongoose.model<IBusiness>(
  "Business",
  businessSchema
);

export default Business;