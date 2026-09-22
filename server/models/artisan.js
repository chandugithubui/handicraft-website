const mongoose = require('mongoose');

const craftProcessSchema = new mongoose.Schema(
  {
    step: {
      type: Number,
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    image: {
      type: String,
      default: ''
    }
  },
  {
    _id: false
  }
);

const artisanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    craft: {
      type: String,
      required: true,
      trim: true
    },

    location: {
      type: String,
      required: true,
      trim: true
    },

    years: {
      type: Number,
      required: true,
      min: 0
    },

    story: {
      type: String,
      required: true,
      trim: true
    },

    image: {
      type: String,
      required: true
    },

    specialty: {
      type: String,
      required: true,
      trim: true
    },

    craftProcess: {
      type: [craftProcessSchema],
      default: []
    },

    featured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Artisan = mongoose.model('Artisan', artisanSchema);

module.exports = Artisan;