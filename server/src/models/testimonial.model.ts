/**
 * server/src/models/testimonial.model.ts
 *
 * Testimonial model and schema definition with strict TypeScript types.
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface ITestimonial extends Document {
  name: string;
  location: string;
  rating: number;
  text: string;
  avatar?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const testimonialSchema = new Schema<ITestimonial>(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true, trim: true },
    avatar: { type: String, default: '' },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const Testimonial = mongoose.models.Testimonial || mongoose.model<ITestimonial>('Testimonial', testimonialSchema);
export default Testimonial;
