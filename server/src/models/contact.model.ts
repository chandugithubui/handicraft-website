/**
 * server/src/models/contact.model.ts
 *
 * Contact message model and schema definition with strict TypeScript types.
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IContact extends Document {
  name: string;
  email: string;
  message: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const contactSchema = new Schema<IContact>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    message: { type: String, required: true, trim: true },
    date: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const Contact = mongoose.models.Contact || mongoose.model<IContact>('Contact', contactSchema);
export default Contact;
