export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';

export interface PaymentItem {
  sku: string;
  description: string;
  quantity: number;
  unitAmount: number;
}

export interface InitiatePaymentInput {
  orderId: string;
  steamId: string;
  currency: string;
  items: PaymentItem[];
}

export interface InitiatePaymentResult {
  providerTransactionId: string;
  status: 'PENDING';
  authorizationUrl?: string;
}

export interface FinalizePaymentResult {
  providerTransactionId: string;
  status: PaymentStatus;
}

export interface PaymentProvider {
  readonly name: 'FAKE' | 'STEAM';
  initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult>;
  finalize(orderId: string): Promise<FinalizePaymentResult>;
  query(orderId: string): Promise<FinalizePaymentResult>;
}

export const PAYMENT_PROVIDER = 'PAYMENT_PROVIDER';
