import React, { useEffect } from 'react';
import { Button } from 'react-bootstrap';

const RazorpayPaymentForm = ({ amount, onSuccess, onError }) => {
  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    try {
      const getApiUrl = () => {
        if (window.location.hostname === 'handicraft-website-fyao.vercel.app' ||
            window.location.hostname.includes('vercel.app')) {
          return 'https://handicraft-website.onrender.com/api';
        }
        return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      };
      const API_URL = getApiUrl();
      // Create Razorpay order
      const response = await fetch(`${API_URL}/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      const orderData = await response.json();

      if (!response.ok) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Handicraft Hub',
        description: 'Payment for handicraft products',
        order_id: orderData.orderId,
        handler: async function (response) {
          // Verify payment on server
          const verifyResponse = await fetch(`${API_URL}/payment/verify-payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            onSuccess(response);
          } else {
            onError('Payment verification failed');
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#e67e22',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      onError(error.message);
    }
  };

  return (
    <div className="razorpay-payment-form">
      <Button
        variant="primary"
        size="lg"
        className="w-100"
        onClick={handlePayment}
      >
        Pay ₹{amount} with Razorpay
      </Button>
      <div className="mt-3 text-center">
        <small className="text-muted">
          Secure payment via Razorpay (Cards, UPI, Net Banking, Wallets)
        </small>
      </div>
    </div>
  );
};

export default RazorpayPaymentForm;
