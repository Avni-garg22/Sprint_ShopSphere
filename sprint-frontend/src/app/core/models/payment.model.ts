export type PaymentStatus = 'SUCCESS' | 'FAILED' | 'PENDING';

export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  mode?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  status: PaymentStatus;
  processedAt: string;
}

export interface RazorpayOrderResponse {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  appOrderId: number;
}

export interface RazorpayVerifyRequest {
  orderId: number;
  amount: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}
