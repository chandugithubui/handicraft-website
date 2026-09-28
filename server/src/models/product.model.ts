/**
 * server/src/models/product.model.ts
 *
 * Product model and schema definition with strict TypeScript types.
 */

import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
  material?: string;
  stock: number;
  rating: number;
  numReviews: number;
  featured: boolean;
  artisan?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    category: { type: String, required: true },
    material: { type: String, trim: true },
    stock: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0, min: 0 },
    featured: { type: Boolean, default: false },
    artisan: {
      type: Schema.Types.ObjectId,
      ref: 'Artisan',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);
export default Product;
