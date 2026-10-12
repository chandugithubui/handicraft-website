
import React, { useEffect, useRef, useState } from 'react';
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
  const [scriptLoaded, setScriptLoaded] = useState(
    () => Boolean((window as any).Razorpay)
  );

  const [isProcessing, setIsProcessing] = useState(false);

  const paymentInProgressRef = useRef(false);

  const onErrorRef = useRef(onError);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const idempotencyKeyRef = useRef<string>(
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `idemp_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 9)}`
  );

  // Load Razorpay SDK without repeatedly removing the script
  useEffect(() => {
    if ((window as any).Razorpay) {
      setScriptLoaded(true);
      return;
    }

    const scriptUrl =
      'https://checkout.razorpay.com/v1/checkout.js';

    let script = document.querySelector<HTMLScriptElement>(
      `script[src="${scriptUrl}"]`
    );

    let active = true;

    const handleLoad = () => {
      if (active) {
        setScriptLoaded(true);
      }
    };

    const handleError = () => {
      if (active) {
        setScriptLoaded(false);
        onErrorRef.current(
          'Unable to load Razorpay. Please check your internet connection or ad-blocker.'
        );
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.src = scriptUrl;
      script.async = true;
      document.body.appendChild(script);
    }

    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);

    // Handle SDK already loaded by another component
    if ((window as any).Razorpay) {
      setScriptLoaded(true);
    }

    return () => {
      active = false;
      script?.removeEventListener('load', handleLoad);
      script?.removeEventListener('error', handleError);
    };
  }, []);

  const resetProcessing = () => {
    paymentInProgressRef.current = false;
    setIsProcessing(false);
  };

  const handlePayment = async () => {
    // Prevent duplicate payment requests
    if (paymentInProgressRef.current || parentLoading) {
      return;
    }

    // Validate shipping form
    if (!validateForm()) {
      return;
    }

    // Check Razorpay SDK
    if (!scriptLoaded || !(window as any).Razorpay) {
      onError(
        'Payment gateway is still initializing. Please wait and try again.'
      );
      return;
    }

    paymentInProgressRef.current = true;
    setIsProcessing(true);

    try {
      // Prepare cart items for backend
      const formattedItems = cartItems.map((item) => ({
        product: item._id,
        quantity: item.quantity,
      }));

      // Create Razorpay order on backend
      const orderData = await createRazorpayOrder({
        amount,
        items: formattedItems,
        couponCode: couponCode || null,
      });

      if (
        !orderData ||
        !orderData.orderId ||
        !orderData.keyId
      ) {
        throw new Error(
          'Invalid order response received from payment gateway'
        );
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Handicraft Hub',
        description: `Order for ${cartItems.length} handcrafted item(s)`,
        order_id: orderData.orderId,

        prefill: {
          name:
            shippingAddress.fullName ||
            user?.name ||
            user?.displayName ||
            '',
          email: user?.email || '',
          contact: shippingAddress.phone || '',
        },

        theme: {
          color: '#B3541E',
        },

        modal: {
          ondismiss: () => {
            resetProcessing();
          },
        },

        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            // Verify payment signature and create order securely
            const result =
              await verifyAndCreateRazorpayOrder({
                razorpay_order_id:
                  response.razorpay_order_id,
                razorpay_payment_id:
                  response.razorpay_payment_id,
                razorpay_signature:
                  response.razorpay_signature,
                items: formattedItems,
                shippingAddress,
                couponCode: couponCode || null,
                idempotencyKey:
                  idempotencyKeyRef.current,
              });

            if (result && result.success) {
              onSuccess(result.order);
            } else {
              onError(
                result?.message ||
                  'Payment verification failed. Please contact support.'
              );
            }
          } catch (verificationError: any) {
            console.error(
              'Order verification error:',
              verificationError
            );

            onError(
              verificationError.response?.data?.message ||
                verificationError.message ||
                'Payment may have been captured, but order verification failed. Please contact support before retrying.'
            );
          } finally {
            resetProcessing();
          }
        },
      };

      // Initialize Razorpay checkout
      const razorpay = new (window as any).Razorpay(
        options
      );

      razorpay.on(
        'payment.failed',
        (failResponse: any) => {
          resetProcessing();

          const reason =
            failResponse?.error?.description ||
            failResponse?.error?.reason ||
            'Payment failed';

          onError(`Payment failed: ${reason}`);
        }
      );

      // Open payment popup
      razorpay.open();
    } catch (error: any) {
      console.error(
        'Razorpay initialization error:',
        error
      );

      resetProcessing();

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
        type="button"
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
        {isLoading && (
          <Spinner animation="border" size="sm" />
        )}

        {isLoading
          ? 'Processing Payment…'
          : !scriptLoaded
          ? 'Loading Razorpay…'
          : `Pay ₹${amount.toLocaleString()} with Razorpay`}
      </Button>

      <div className="mt-3 text-center">
        <small
          className="text-muted"
          style={{ fontSize: '12px' }}
        >
          🔒 Secure checkout via Razorpay
          (UPI, Credit/Debit Cards, Net Banking, Wallets)
        </small>
      </div>
    </div>
  );
};

export default RazorpayPaymentForm;
