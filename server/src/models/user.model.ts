/**
 * server/src/models/user.model.ts
 *
 * Mongoose schema and model definition for User accounts,
 * with full support for local password authentication, Google OAuth 2.0 accounts,
 * account linking, and refresh token rotation with family revocation.
 */

import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IRefreshToken {
  tokenHash: string;
  family: string;
  expiresAt: Date;
  createdAt: Date;
  isRevoked: boolean;
  replacedByTokenHash?: string | null;
}

export interface IUser {
  name: string;
  email: string;
  password?: string | null;
  avatar?: string | null;
  /**
   * Role slug stored as a free string — validated against the Role collection at runtime.
   * Keeping it as a string (not a DB ref) allows fast JWT reads without a join on every request.
   */
  role: string;
  /** Per-user permission overrides — merged on top of the role's permissions at login. */
  customPermissions: string[];
  googleId?: string | null;
  authProviders: ('local' | 'google')[];
  refreshTokens: IRefreshToken[];
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  phone?: string | null;
  address?: string | null;
  cart?: {
    product: mongoose.Types.ObjectId;
    quantity: number;
  }[];
  wishlist?: mongoose.Types.ObjectId[];
  createdAt: Date;
}

export interface IUserDocument extends IUser, Document {
  _id: mongoose.Types.ObjectId;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    tokenHash: {
      type: String,
      required: true,
      index: true,
    },
    family: {
      type: String,
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    replacedByTokenHash: {
      type: String,
      default: null,
    },
  },
  { _id: false }
);

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: false,
      default: null,
      minlength: 6,
    },

    avatar: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      /**
       * No closed enum here — role names are managed in the Role collection.
       * Default is 'user' (the base customer role seeded at startup).
       */
      default: 'user',
      trim: true,
      lowercase: true,
    },

    customPermissions: {
      type: [String],
      default: [],
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
      index: true,
    },

    authProviders: {
      type: [String],
      enum: ['local', 'google'],
      default: ['local'],
    },

    refreshTokens: {
      type: [refreshTokenSchema],
      default: [],
    },

    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpires: {
      type: Date,
      default: null,
    },

    phone: {
      type: String,
      default: null,
      trim: true,
    },

    address: {
      type: String,
      default: null,
      trim: true,
    },

    cart: {
      type: [
        {
          product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1,
          },
        },
      ],
      default: [],
    },

    wishlist: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Product',
        },
      ],
      default: [],
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Prevent model recompilation in watch mode / hot-reload / test environments
export const UserModel: Model<IUserDocument> =
  (mongoose.models.User as Model<IUserDocument>) ||
  mongoose.model<IUserDocument>('User', userSchema);

export const User = UserModel;
export default UserModel;
