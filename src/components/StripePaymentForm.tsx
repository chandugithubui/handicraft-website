import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button, Alert } from 'react-bootstrap';
import './StripePaymentForm.css';

const StripePaymentForm = ({ amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    setError(null);

    if (!stripe || !elements) {
      setProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        setError(error.message);
        onError(error.message);
      } else {
        onSuccess(paymentMethod);
      }
    } catch (err) {
      setError(err.message);
      onError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-payment-form">
      <div className="mb-3">
        <label className="form-label">Card Details</label>
        <div className="card-element-container">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>

      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

      <Button
        type="submit"
        variant="primary"
        className="w-100"
        disabled={!stripe || processing}
      >
        {processing ? 'Processing...' : `Pay ₹${amount}`}
      </Button>
    </form>
  );
};

export default StripePaymentForm;
