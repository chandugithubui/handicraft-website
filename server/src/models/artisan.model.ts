/**
 * server/src/models/artisan.model.ts
 *
 * Artisan model and schema definition with strict TypeScript types.
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface ICraftProcess {
  step: number;
  title: string;
  description: string;
  image?: string;
}

export interface IArtisan extends Document {
  name: string;
  slug: string;
  craft: string;
  location: string;
  years: number;
  story: string;
  image: string;
  specialty: string;
  craftProcess: ICraftProcess[];
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const craftProcessSchema = new Schema<ICraftProcess>(
  {
    step: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    image: { type: String, default: '' },
  },
  { _id: false }
);

const artisanSchema = new Schema<IArtisan>(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    craft: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    years: { type: Number, required: true, min: 0 },
    story: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    specialty: { type: String, required: true, trim: true },
    craftProcess: { type: [craftProcessSchema], default: [] },
    featured: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const Artisan = mongoose.models.Artisan || mongoose.model<IArtisan>('Artisan', artisanSchema);
export default Artisan;
