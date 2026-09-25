import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getActiveCoupons } from '../services/couponService';
import './CouponOffer.css';

const CouponOffer = () => {
  const [coupon, setCoupon] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchActiveCoupon = async () => {
      try {
        const coupons = await getActiveCoupons();

        if (coupons && coupons.length > 0) {
          setCoupon(coupons[0]);
        }
      } catch (error) {
        console.error('Failed to load active coupon:', error);
      }
    };

    fetchActiveCoupon();
  }, []);

  const handleCopyCode = async () => {
    if (!coupon?.code) return;

    try {
      await navigator.clipboard.writeText(coupon.code);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy coupon code:', error);
    }
  };

  // Don't display the section when no active coupon exists
  if (!coupon) {
    return null;
  }

  const discountText =
    coupon.discountType === 'percentage'
      ? `${coupon.discountValue}% OFF`
      : `₹${coupon.discountValue} OFF`;

  return (
    <section className="coupon-offer-section">
      <div className="coupon-offer-container">

        <div className="coupon-offer-content">
          <span className="coupon-offer-label">
            SPECIAL OFFER
          </span>

          <h2>{discountText}</h2>

          <p className="coupon-offer-description">
            Save on beautiful handcrafted products made by Indian artisans.
          </p>

          <p className="coupon-condition">
            Minimum order ₹{coupon.minimumOrderAmount}
            {coupon.maxDiscountAmount && (
              <>
                {' '}• Maximum discount ₹{coupon.maxDiscountAmount}
              </>
            )}
          </p>

          <div className="coupon-code-wrapper">
            <div className="coupon-code">
              <span>Use Code</span>
              <strong>{coupon.code}</strong>
            </div>

            <button
              type="button"
              className="copy-coupon-btn"
              onClick={handleCopyCode}
            >
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>

          <Link to="/products" className="coupon-shop-btn">
            Shop Now
          </Link>
        </div>

      </div>
    </section>
  );
};

export default CouponOffer;