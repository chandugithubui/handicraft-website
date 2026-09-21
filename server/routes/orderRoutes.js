const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Order = require('../models/order');
const Product = require('../models/product');
const Coupon = require('../models/coupon');
const User = require('../models/user');
const { auth } = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');

/* =========================================================
   CREATE NEW ORDER
   POST /api/orders
========================================================= */

router.post('/', auth, async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      couponCode
    } = req.body;

    /* -------------------------------------------------------
       1. Validate items
    ------------------------------------------------------- */

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error(
        'Order creation error: Items array is empty or invalid'
      );

      return res.status(400).json({
        message: 'Order must contain at least one item'
      });
    }

    /* -------------------------------------------------------
       2. Validate each item and get real product data
    ------------------------------------------------------- */

    const validatedItems = [];

    for (const item of items) {
      // Validate product ID
      if (!mongoose.Types.ObjectId.isValid(item.product)) {
        console.error(
          'Order creation error: Invalid product ID:',
          item.product
        );

        return res.status(400).json({
          message: `Invalid product ID: ${item.product}`
        });
      }

      // Validate quantity
      if (
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return res.status(400).json({
          message: 'Product quantity must be a positive integer'
        });
      }

      // Find product in MongoDB
      const product = await Product.findById(item.product);

      if (!product) {
        console.error(
          'Order creation error: Product not found:',
          item.product
        );

        return res.status(404).json({
          message: `Product not found: ${item.product}`
        });
      }

      // Check stock
      if (product.stock < item.quantity) {
        console.error(
          'Order creation error: Insufficient stock',
          {
            product: product.name,
            available: product.stock,
            requested: item.quantity
          }
        );

        return res.status(400).json({
          message:
            `Insufficient stock for ${product.name}. ` +
            `Available: ${product.stock}, ` +
            `Requested: ${item.quantity}`
        });
      }

      /* -----------------------------------------------------
         Use trusted product information from database.

         Do NOT trust price/name/image sent by frontend.
      ----------------------------------------------------- */

      validatedItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.imageUrl
      });
    }

    /* -------------------------------------------------------
       3. Calculate subtotal from trusted database prices
    ------------------------------------------------------- */

    const subtotal = validatedItems.reduce(
      (sum, item) => {
        return sum + item.price * item.quantity;
      },
      0
    );

    /* -------------------------------------------------------
       4. Calculate shipping on backend
    ------------------------------------------------------- */

    const shippingAmount = subtotal >= 999 ? 0 : 99;

    /* -------------------------------------------------------
       5. Validate and calculate coupon discount
    ------------------------------------------------------- */

    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode && couponCode.trim()) {
      const normalizedCouponCode =
        couponCode.trim().toUpperCase();

      const coupon = await Coupon.findOne({
        code: normalizedCouponCode
      });

      // Coupon does not exist
      if (!coupon) {
        return res.status(400).json({
          message: 'Invalid coupon code'
        });
      }

      // Coupon disabled by admin
      if (!coupon.isActive) {
        return res.status(400).json({
          message: 'This coupon is inactive'
        });
      }

      // Coupon expired
      if (new Date() > coupon.expiryDate) {
        return res.status(400).json({
          message: 'This coupon has expired'
        });
      }

      // Usage limit reached
      if (
        coupon.usageLimit !== null &&
        coupon.usedCount >= coupon.usageLimit
      ) {
        return res.status(400).json({
          message: 'Coupon usage limit has been reached'
        });
      }

      // Minimum order requirement
      if (subtotal < coupon.minimumOrderAmount) {
        return res.status(400).json({
          message:
            `Minimum order amount is ₹${coupon.minimumOrderAmount}`
        });
      }

      /* -----------------------------------------------------
         Calculate discount
      ----------------------------------------------------- */

      if (coupon.discountType === 'percentage') {
        discountAmount =
          (subtotal * coupon.discountValue) / 100;

        // Apply maximum discount cap
        if (
          coupon.maxDiscountAmount !== null &&
          discountAmount > coupon.maxDiscountAmount
        ) {
          discountAmount = coupon.maxDiscountAmount;
        }
      } else {
        // Fixed discount
        discountAmount = coupon.discountValue;
      }

      // Discount must never exceed subtotal
      discountAmount = Math.min(
        discountAmount,
        subtotal
      );

      discountAmount = Number(
        discountAmount.toFixed(2)
      );

      appliedCoupon = coupon;
    }

    /* -------------------------------------------------------
       6. Calculate final payable amount
    ------------------------------------------------------- */

    const totalAmount = Number(
      (
        subtotal +
        shippingAmount -
        discountAmount
      ).toFixed(2)
    );

    /* -------------------------------------------------------
       7. Reduce product stock
    ------------------------------------------------------- */

    for (const item of validatedItems) {
      const updatedProduct =
        await Product.findOneAndUpdate(
          {
            _id: item.product,
            stock: { $gte: item.quantity }
          },
          {
            $inc: {
              stock: -item.quantity
            }
          },
          {
            new: true
          }
        );

      // Stock may have changed between validation and update
      if (!updatedProduct) {
        return res.status(400).json({
          message:
            `Unable to reserve stock for ${item.name}. ` +
            'Please try again.'
        });
      }
    }

    /* -------------------------------------------------------
       8. Create order
    ------------------------------------------------------- */

    const order = new Order({
      user: req.user.userId,

      items: validatedItems,

      shippingAddress,

      paymentMethod: paymentMethod || 'COD',

      subtotal,

      shippingAmount,

      couponCode: appliedCoupon
        ? appliedCoupon.code
        : null,

      discountAmount,

      totalAmount
    });

    /* -------------------------------------------------------
       9. Save order
    ------------------------------------------------------- */

    await order.save();

    /* -------------------------------------------------------
       10. Increment coupon usage only after successful order
    ------------------------------------------------------- */

    if (appliedCoupon) {
      await Coupon.findByIdAndUpdate(
        appliedCoupon._id,
        {
          $inc: {
            usedCount: 1
          }
        }
      );
    }

    console.log(
      'Order created successfully:',
      order._id.toString()
    );
    const customer = await User.findById(
      req.user.userId
    ).select('name email');

    /* -------------------------------------------------------
   11. Send customer order confirmation email
------------------------------------------------------- */

    try {

      if (customer && customer.email) {
        const itemsHtml = validatedItems
          .map(
            (item) => `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eeeeee;">
              ${item.name}
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #eeeeee;">
              ${item.quantity}
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #eeeeee;">
              ₹${item.price}
            </td>
          </tr>
        `
          )
          .join('');

        await sendEmail({
          to: customer.email,
          subject: `Order Confirmation - Handicraft Hub`,
          html: `
        <div style="font-family: Arial, sans-serif; color: #333333;">
          <h2 style="color: #7b1717;">
            Thank you for your order!
          </h2>

          <p>Hi ${customer.name},</p>

          <p>
            Your order has been placed successfully.
          </p>

          <p>
            <strong>Order ID:</strong> ${order._id}
          </p>

          <table
            style="width: 100%; border-collapse: collapse; margin: 20px 0;"
          >
            <thead>
              <tr>
                <th style="text-align: left; padding: 8px;">
                  Product
                </th>
                <th style="text-align: left; padding: 8px;">
                  Quantity
                </th>
                <th style="text-align: left; padding: 8px;">
                  Price
                </th>
              </tr>
            </thead>

            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <p>
            Subtotal:
            <strong>₹${subtotal}</strong>
          </p>

          <p>
            Shipping:
            <strong>
              ${shippingAmount === 0 ? 'Free' : `₹${shippingAmount}`}
            </strong>
          </p>

          ${discountAmount > 0
              ? `
                <p>
                  Discount${appliedCoupon
                ? ` (${appliedCoupon.code})`
                : ''
              }:
                  <strong>-₹${discountAmount}</strong>
                </p>
              `
              : ''
            }

          <h3 style="color: #7b1717;">
            Total Paid: ₹${totalAmount}
          </h3>

          <p>
            Payment Method:
            <strong>${paymentMethod || 'COD'}</strong>
          </p>

          <p>
            We'll notify you when your order status changes.
          </p>

          <p>
            Thank you for supporting Indian artisans.
          </p>

          <p>
            <strong>Handicraft Hub</strong>
          </p>
        </div>
      `
        })
          .then(() => {
            console.log(
              'Order confirmation email sent to customer'
            );
          })
          .catch((emailError) => {
            console.error(
              'Order confirmation email failed:',
              emailError.message
            );
          });
      }
    } catch (emailError) {
      console.error(
        'Order confirmation setup failed:',
        emailError.message
      );
    }
    /* -------------------------------------------------------
   12. Send new order notification to admin
   ------------------------------------------------------- */

    // Send new order notification to admin
    try {
      const adminEmail = process.env.ADMIN_EMAIL;

      if (adminEmail) {
        const itemsHtml = order.items
          .map(
            (item) => `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">
              ${item.name}
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">
              ${item.quantity}
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">
              ₹${item.price}
            </td>
          </tr>
        `
          )
          .join('');

        sendEmail({
          to: adminEmail,
          subject: `New Order Received - ${order._id}`,
          html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto;">
          <h2 style="color: #7b1717;">New Order Received</h2>

          <p>A new order has been placed on Handicraft Hub.</p>

          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Customer:</strong> ${customer?.name || 'N/A'}</p>
          <p><strong>Email:</strong> ${customer?.email || 'N/A'}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>

          <h3>Order Items</h3>

          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="text-align: left; padding: 8px;">Product</th>
                <th style="text-align: left; padding: 8px;">Quantity</th>
                <th style="text-align: left; padding: 8px;">Price</th>
              </tr>
            </thead>

            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="margin-top: 20px;">
            <p><strong>Subtotal:</strong> ₹${order.subtotal}</p>

            <p>
              <strong>Shipping:</strong>
              ${order.shippingAmount === 0
              ? 'Free'
              : `₹${order.shippingAmount}`
            }
            </p>

            ${order.discountAmount > 0
              ? `<p><strong>Discount:</strong> -₹${order.discountAmount}</p>`
              : ''
            }

            <h3 style="color: #7b1717;">
              Order Total: ₹${order.totalAmount}
            </h3>
          </div>

          <h3>Shipping Address</h3>

          <p>
            ${order.shippingAddress.fullName}<br>
            ${order.shippingAddress.address}<br>
            ${order.shippingAddress.city},
            ${order.shippingAddress.state} -
            ${order.shippingAddress.pincode}<br>
            Phone: ${order.shippingAddress.phone}
          </p>
        </div>
      `
        })
          .then(() => {
            console.log(
              'Admin order notification sent successfully'
            );
          })
          .catch((emailError) => {
            console.error(
              'Admin order notification failed:',
              emailError.message
            );
          });

      }


    } catch (emailError) {
      console.error(
        'Admin email setup failed:',
        emailError.message
      );
    }


    /* -------------------------------------------------------
       13. Send response
    ------------------------------------------------------- */

    return res.status(201).json({
      message: 'Order placed successfully',
      order
    });

  } catch (error) {
    console.error(
      '========== ORDER CREATION ERROR =========='
    );
    console.error('Message:', error.message);
    console.error('Name:', error.name);
    console.error('Stack:', error.stack);
    console.error('Request body:', req.body);
    console.error('User:', req.user);
    console.error(
      '=========================================='
    );

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message:
          'Validation error: ' + error.message
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        message:
          'Invalid data format: ' + error.message
      });
    }

    return res.status(500).json({
      message:
        error.message ||
        'Server error during order creation'
    });
  }
});


/* =========================================================
   GET USER ORDERS
   GET /api/orders/my-orders
========================================================= */

router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.userId
    })
      .sort({ createdAt: -1 })
      .lean();

    /* -------------------------------------------------------
       Fix image paths and ensure item values are available
    ------------------------------------------------------- */

    const ordersWithFixedImages = orders.map(
      (order) => {
        const fixedItems = order.items.map(
          (item) => {
            let imageUrl = item.image;

            // Remove accidental double extensions
            if (
              imageUrl &&
              imageUrl.endsWith('.jpg.jpg')
            ) {
              imageUrl = imageUrl.replace(
                '.jpg.jpg',
                '.jpg'
              );
            }

            if (
              imageUrl &&
              imageUrl.endsWith('.jpeg.jpeg')
            ) {
              imageUrl = imageUrl.replace(
                '.jpeg.jpeg',
                '.jpeg'
              );
            }

            return {
              ...item,
              image: imageUrl,
              price: item.price ?? 0,
              quantity: item.quantity ?? 1
            };
          }
        );

        return {
          ...order,
          items: fixedItems
        };
      }
    );

    return res.json(ordersWithFixedImages);

  } catch (error) {
    console.error(
      'Get orders error:',
      error
    );

    return res.status(500).json({
      message: 'Server error'
    });
  }
});


/* =========================================================
   GET SINGLE ORDER
   GET /api/orders/:id
========================================================= */

router.get('/:id', auth, async (req, res) => {
  try {
    // Validate order ID
    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        message: 'Invalid order ID'
      });
    }

    const order = await Order.findById(
      req.params.id
    ).lean();

    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    /* -------------------------------------------------------
       Check ownership or admin access
    ------------------------------------------------------- */

    if (
      !order.user ||
      (
        order.user.toString() !==
        req.user.userId &&
        req.user.role !== 'admin'
      )
    ) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    /* -------------------------------------------------------
       Fix item image paths and values
    ------------------------------------------------------- */

    const fixedItems = order.items.map(
      (item) => {
        let imageUrl = item.image;

        if (
          imageUrl &&
          imageUrl.endsWith('.jpg.jpg')
        ) {
          imageUrl = imageUrl.replace(
            '.jpg.jpg',
            '.jpg'
          );
        }

        if (
          imageUrl &&
          imageUrl.endsWith('.jpeg.jpeg')
        ) {
          imageUrl = imageUrl.replace(
            '.jpeg.jpeg',
            '.jpeg'
          );
        }

        return {
          ...item,
          image: imageUrl,
          price: item.price ?? 0,
          quantity: item.quantity ?? 1
        };
      }
    );

    return res.json({
      ...order,
      items: fixedItems
    });

  } catch (error) {
    console.error(
      'Get order error:',
      error
    );

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid order ID'
      });
    }

    return res.status(500).json({
      message: 'Server error'
    });
  }
});


/* =========================================================
   UPDATE ORDER STATUS
   PATCH /api/orders/:id/status

   Admin only
========================================================= */

router.patch(
  '/:id/status',
  auth,
  async (req, res) => {
    try {
      const { orderStatus } = req.body;

      /* -------------------------------------------------------
         Admin check
      ------------------------------------------------------- */

      if (req.user.role !== 'admin') {
        return res.status(403).json({
          message:
            'Access denied. Admin only.'
        });
      }

      /* -------------------------------------------------------
         Validate order ID
      ------------------------------------------------------- */

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          message: 'Invalid order ID'
        });
      }

      /* -------------------------------------------------------
         Validate order status
      ------------------------------------------------------- */

      const allowedStatuses = [
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled'
      ];

      if (
        !allowedStatuses.includes(
          orderStatus
        )
      ) {
        return res.status(400).json({
          message: 'Invalid order status'
        });
      }

      /* -------------------------------------------------------
         Update order
      ------------------------------------------------------- */

      const order =
        await Order.findByIdAndUpdate(
          req.params.id,
          {
            orderStatus
          },
          {
            new: true,
            runValidators: true
          }
        );

      if (!order) {
        return res.status(404).json({
          message: 'Order not found'
        });
      }

      /* -------------------------------------------------------
   Send order status update email to customer
------------------------------------------------------- */

      try {
        const customer = await User.findById(
          order.user
        ).select('name email');

        if (customer && customer.email) {

          const statusMessages = {
            pending: 'Your order has been received and is pending confirmation.',
            processing: 'Your order is now being processed.',
            shipped: 'Great news! Your order has been shipped.',
            delivered: 'Your order has been delivered successfully.',
            cancelled: 'Your order has been cancelled.'
          };

          sendEmail({
            to: customer.email,
            subject: `Order ${orderStatus} - Handicraft Hub`,
            html: `
        <div style="font-family: Arial, sans-serif; color: #333333; max-width: 650px; margin: auto;">

          <h2 style="color: #7b1717;">
            Order Status Updated
          </h2>

          <p>Hi ${customer.name},</p>

          <p>
            ${statusMessages[orderStatus]}
          </p>

          <p>
            <strong>Order ID:</strong> ${order._id}
          </p>

          <p>
            <strong>Current Status:</strong>
            ${orderStatus.toUpperCase()}
          </p>

          <p>
            <strong>Order Total:</strong>
            ₹${order.totalAmount}
          </p>

          <p>
            You can check your order details from the
            My Orders section of Handicraft Hub.
          </p>

          <p>
            Thank you for supporting Indian artisans.
          </p>

          <p>
            <strong>Handicraft Hub</strong>
          </p>

        </div>
      `
          })
            .then(() => {
              console.log(
                `Order status email sent to customer: ${orderStatus}`
              );
            })
            .catch((emailError) => {
              console.error(
                'Order status email failed:',
                emailError.message
              );
            });
        }

      } catch (emailError) {
        console.error(
          'Order status email setup failed:',
          emailError.message
        );
      }
      return res.json(order);

    } catch (error) {
      console.error(
        'Update order status error:',
        error
      );

      if (
        error.name === 'ValidationError'
      ) {
        return res.status(400).json({
          message:
            'Validation error: ' +
            error.message
        });
      }

      if (error.name === 'CastError') {
        return res.status(400).json({
          message: 'Invalid order ID'
        });
      }

      return res.status(500).json({
        message: 'Server error'
      });
    }
  }
);


/* =========================================================
   EXPORT ROUTER
========================================================= */

module.exports = router;