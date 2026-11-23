export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'inflow' | 'outflow';
  category: string;
  date: string;     // Format tampilan: "23 Nov 2026 • 22:26"
  dateKey: string;  // Format filter historis: "2026-11-23"
}

export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  priceIdr: number;
}