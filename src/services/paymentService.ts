import apiClient from './apiClient';

export interface CreateRazorpayOrderInput {
  amount?: number;
  items?: Array<{ product: string; quantity: number }>;
  couponCode?: string | null;
}

export interface VerifyAndCreateOrderInput {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  items: Array<{ product: string; quantity: number }>;
  shippingAddress: any;
  couponCode?: string | null;
  idempotencyKey?: string;
}

/**
 * Initializes a Razorpay order on the backend.
 * The backend verifies items and calculates the true server-side amount.
 */
export const createRazorpayOrder = async (input: CreateRazorpayOrderInput | number) => {
  const payload = typeof input === 'number' ? { amount: input } : input;
  const response = await apiClient.post<{
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
  }>('/payment/create-order', payload);
  return response.data;
};

/**
 * Industry-standard atomic verification & order placement with idempotency.
 */
export const verifyAndCreateRazorpayOrder = async (payload: VerifyAndCreateOrderInput) => {
  const response = await apiClient.post<{
    success: boolean;
    message: string;
    order: any;
  }>('/payment/verify-and-create-order', payload);
  return response.data;
};

/**
 * Legacy standalone payment verification
 */
export const verifyRazorpayPayment = async (paymentData: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) => {
  const response = await apiClient.post<{
    success: boolean;
    message: string;
  }>('/payment/verify-payment', paymentData);
  return response.data;
};
