export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'inflow' | 'outflow';
  category: string;
  date: string;
}

export interface CryptoAsset {
  id: string;
  name: string;
  symbol: string;
  amount: number;
  priceIdr: number;
}

export type ModalType = 'none' | 'setup' | 'transaction' | 'crypto';