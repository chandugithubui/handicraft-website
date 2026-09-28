import mongoose, { Document, Model, Schema } from 'mongoose';
import { IRole } from '../types/rbac.types';

export interface IRoleDocument extends IRole, Document {
  _id: mongoose.Types.ObjectId;
}

const roleSchema = new Schema<IRoleDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    permissions: {
      type: [String],
      default: [],
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent deleting system roles via model hook
roleSchema.pre('deleteOne', { document: true, query: false }, function (next) {
  if (this.isSystem) {
    return next(new Error('System roles cannot be deleted.'));
  }
  next();
});

export const RoleModel: Model<IRoleDocument> =
  (mongoose.models.Role as Model<IRoleDocument>) ||
  mongoose.model<IRoleDocument>('Role', roleSchema);

export default RoleModel;
