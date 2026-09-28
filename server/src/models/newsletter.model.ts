/**
 * server/src/models/newsletter.model.ts
 *
 * Newsletter subscription model and schema definition with strict TypeScript types.
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface INewsletter extends Document {
  email: string;
  subscribedAt: Date;
  status: 'active' | 'unsubscribed';
  createdAt: Date;
  updatedAt: Date;
}

const newsletterSchema = new Schema<INewsletter>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['active', 'unsubscribed'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

export const Newsletter = mongoose.models.Newsletter || mongoose.model<INewsletter>('Newsletter', newsletterSchema);
export default Newsletter;
