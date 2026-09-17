const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      name: String,
      price: Number,
      quantity: Number,
      image: String
    }
  ],
  shippingAddress: {
    fullName: String,
    address: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    phone: String
  },
  paymentMethod: {
    type: String,
    default: 'COD'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  subtotal: {
  type: Number,
  required: true,
  min: 0
},

shippingAmount: {
  type: Number,
  default: 0,
  min: 0
},

couponCode: {
  type: String,
  uppercase: true,
  trim: true,
  default: null
},

discountAmount: {
  type: Number,
  default: 0,
  min: 0
},

totalAmount: {
  type: Number,
  required: true,
  min: 0
},

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
