/**
 * server/src/models/category.model.ts
 *
 * Category model and schema definition with strict TypeScript types.
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Category = mongoose.models.Category || mongoose.model<ICategory>('Category', categorySchema);
export default Category;
