/**
 * Payment Service for PayOS Integration
 * Handles payment creation, status checking, and cancellation
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface CreatePaymentRequest {
  bookingId: string;
}

export interface PaymentLinkResponse {
  checkoutUrl: string;
  orderCode: number;
  bookingId: string;
}

export interface PaymentStatusResponse {
  paymentInfo: {
    orderCode: number;
    amount: number;
    status: string;
    transactions: any[];
  };
  booking: {
    id: string;
    status: string;
    paymentStatus: string;
    totalAmount: number;
  } | null;
}

/**
 * Create payment link for a booking
 * @param bookingId - ID of the booking
 * @param token - Optional access token (for authenticated users)
 */
export const createPaymentLink = async (bookingId: string, token?: string): Promise<PaymentLinkResponse> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Only add Authorization header if token exists (authenticated users)
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(new URL('/api/v1/payments/create', API_URL).toString(), {
    method: 'POST',
    headers,
    credentials: 'include', // Include cookies for refresh token
    body: JSON.stringify({ bookingId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create payment link');
  }

  return response.json();
};

/**
 * Check payment status by order code
 * @param orderCode - PayOS order code
 * @param token - Optional access token (for authenticated users)
 */
export const checkPaymentStatus = async (orderCode: string, token?: string): Promise<PaymentStatusResponse> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/api/v1/payments/status/${orderCode}`, {
    method: 'GET',
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to check payment status');
  }

  return response.json();
};

/**
 * Cancel payment for a booking
 * @param bookingId - ID of the booking
 * @param token - Optional access token (for authenticated users)
 */
export const cancelPayment = async (
  bookingId: string,
  token?: string
): Promise<{ success: boolean; message: string }> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/api/v1/payments/cancel/${bookingId}`, {
    method: 'POST',
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to cancel payment');
  }

  return response.json();
};

export default {
  createPaymentLink,
  checkPaymentStatus,
  cancelPayment,
};
