export type MarketState = 'OPEN' | 'CLOSED' | 'ENDED';
export type KeywordCount = { keyword: string; count: number };

export type Market = {
  id: number;
  title: string;
  neighborhood: string;
  place: string;
  address: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  totalBooths: number;
  baseFee: number;
  autoApprove: boolean;
  description: string;
  state: MarketState;
  stateLabel: string;
  applyDeadline: string;
  takenBooths: number;
  remainingBooths: number;
};

export type MarketListItem = Market & { sellerCount: number; topKeywords: KeywordCount[] };

export type Equipment = {
  id: number;
  name: string;
  unitPrice: number;
  totalQuantity: number;
  description: string;
};

export type SellerPreview = {
  applicationId: number;
  sellerName: string;
  boothCount: number;
  keywords: string[];
  intro: string;
  saleLinks: string[];
  photoIds: number[];
};

export type MarketDetail = Market & {
  keywords: KeywordCount[];
  sellers: SellerPreview[];
  equipment: (Equipment & { remaining: number })[];
};

export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED';
export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUND_PENDING' | 'REFUNDED';

export type Application = {
  id: number;
  market: Pick<Market, 'id' | 'title' | 'eventDate' | 'startTime' | 'endTime' | 'place' | 'neighborhood' | 'state'>;
  seller: { id: number; name: string; email: string; phone: string };
  boothCount: number;
  baseFee: number;
  equipment: { equipmentId: number; name: string; quantity: number; unitPrice: number }[];
  keywords: string[];
  memo: string;
  intro: string;
  saleLinks: string[];
  photoIds: number[];
  status: ApplicationStatus;
  paymentStatus: PaymentStatus;
  statusLabel: string;
  totalFee: number;
  paymentDueAt: string | null;
  account: { bank: string; number: string; holder: string; depositor: string } | null;
  canCancel: boolean;
  cancelDeadline: string;
  cancelReason: 'SELLER' | 'PAYMENT_DUE' | null;
  rejectReason: string | null;
  createdAt: string;
  message?: string;
};

export type Inquiry = {
  id: number;
  content: string;
  status: 'NEW' | 'DONE';
  createdAt: string;
  market: { id: number; title: string; eventDate: string };
  seller: { name: string; email: string; phone: string };
};

export type MarketStatRow = {
  marketId: number;
  title: string;
  eventDate: string;
  state: MarketState;
  stateLabel: string;
  totalBooths: number;
  remainingBooths: number;
  pending: number;
  unpaid: number;
  paidAmount: number;
  refundPending: number;
};

export type Stats = {
  marketId: number | null;
  upcomingMarkets: number;
  remainingBooths: number;
  pending: number;
  paidAmount: number;
  unpaid: number;
  refundPending: number;
  newInquiries: number;
  byMarket: MarketStatRow[];
};
