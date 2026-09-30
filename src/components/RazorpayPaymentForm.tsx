import React, { useEffect, useState, useRef } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import {
  createRazorpayOrder,
  verifyAndCreateRazorpayOrder,
} from '../services/paymentService';

interface RazorpayPaymentFormProps {
  amount: number;
  cartItems: any[];
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  couponCode?: string | null;
  user?: any;
  validateForm: () => boolean;
  onSuccess: (order: any) => void;
  onError: (error: string) => void;
  loading?: boolean;
}

const RazorpayPaymentForm: React.FC<RazorpayPaymentFormProps> = ({
  amount,
  cartItems,
  shippingAddress,
  couponCode,
  user,
  validateForm,
  onSuccess,
  onError,
  loading: parentLoading = false,
}) => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Per-checkout idempotency key to prevent double submissions on network retries
  const idempotencyKeyRef = useRef<string>(
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  );

  useEffect(() => {
    // Check if SDK already loaded
    if ((window as any).Razorpay) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay SDK');
      onError('Unable to load payment gateway. Please check your internet connection or ad-blocker.');
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [onError]);

  const handlePayment = async () => {
    // 1. Client-side form validation check
    if (!validateForm()) {
      return;
    }

    if (!scriptLoaded || !(window as any).Razorpay) {
      onError('Payment gateway is still initializing. Please wait a moment and try again.');
      return;
    }

    setIsProcessing(true);

    try {
      // 2. Create server-verified Razorpay order with actual cart items & coupon
      const formattedItems = cartItems.map((item) => ({
        product: item._id,
        quantity: item.quantity,
      }));

      const orderData = await createRazorpayOrder({
        amount,
        items: formattedItems,
        couponCode: couponCode || null,
      });

      if (!orderData || !orderData.orderId) {
        throw new Error('Invalid order response received from payment gateway');
      }

      // 3. Configure Razorpay modal options
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Handicraft Hub',
        description: `Order for ${cartItems.length} handcrafted item(s)`,
        order_id: orderData.orderId,
        prefill: {
          name: shippingAddress.fullName || user?.name || user?.displayName || '',
          email: user?.email || '',
          contact: shippingAddress.phone || '',
        },
        theme: {
          color: '#B3541E',
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            // 4. Atomic signature verification & order placement on backend
            const result = await verifyAndCreateRazorpayOrder({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              items: formattedItems,
              shippingAddress,
              couponCode: couponCode || null,
              idempotencyKey: idempotencyKeyRef.current,
            });

            if (result && result.success) {
              onSuccess(result.order);
            } else {
              onError(result?.message || 'Payment verification failed. Please contact support.');
            }
          } catch (verificationError: any) {
            console.error('Order verification error:', verificationError);
            onError(
              verificationError.response?.data?.message ||
              verificationError.message ||
              'Payment was captured, but we encountered an issue finalizing your order. Our team will verify it shortly.'
            );
          } finally {
            setIsProcessing(false);
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (failResponse: any) => {
        setIsProcessing(false);
        const reason = failResponse?.error?.description || failResponse?.error?.reason || 'Payment failed';
        onError(`Payment failed: ${reason}`);
      });

      rzp.open();
    } catch (error: any) {
      console.error('Razorpay initialization error:', error);
      setIsProcessing(false);
      onError(
        error.response?.data?.message ||
        error.message ||
        'Unable to initialize payment. Please try again.'
      );
    }
  };

  const isLoading = parentLoading || isProcessing;

  return (
    <div className="razorpay-payment-form">
      <Button
        variant="primary"
        size="lg"
        className="w-100 place-order-btn"
        onClick={handlePayment}
        disabled={isLoading || !scriptLoaded}
        style={{
          backgroundColor: '#B3541E',
          borderColor: '#B3541E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        {isLoading && <Spinner animation="border" size="sm" />}
        {isLoading ? 'Processing Payment…' : `Pay ₹${amount.toLocaleString()} with Razorpay`}
      </Button>
      <div className="mt-3 text-center">
        <small className="text-muted" style={{ fontSize: '12px' }}>
          🔒 Secure 256-bit encrypted checkout via Razorpay (UPI, Credit/Debit Cards, Net Banking, Wallets)
        </small>
      </div>
    </div>
  );
};

export default RazorpayPaymentForm;
