/**
 * server/src/utils/pricing.ts
 *
 * Shared pricing logic to ensure consistency across COD and Razorpay flows.
 * Prevents frontend-backend shipping calculation mismatches.
 */

/**
 * Calculate shipping amount based on subtotal
 * Standardized policy:
 * - Subtotal < ₹999 → ₹99 shipping
 * - Subtotal ≥ ₹999 → Free shipping
 */
export function calculateShipping(subtotal: number): number {
  return subtotal >= 999 ? 0 : 99;
}

/**
 * Calculate final total with shipping and discount
 */
export function calculateTotal(
  subtotal: number,
  discountAmount: number = 0
): number {
  const shippingAmount = calculateShipping(subtotal);
  return Math.max(0, subtotal + shippingAmount - discountAmount);
}
