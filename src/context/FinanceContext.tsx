import { CryptoAsset, Transaction } from '@/types';
import React, { createContext, useContext, useState } from 'react';

interface FinanceContextType {
  cashBalance: number;
  dailyLimit: number;
  transactions: Transaction[];
  cryptoAssets: CryptoAsset[];
  addTransaction: (tx: { title: string; amount: number; type: 'inflow' | 'outflow'; category: string }) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [initialBalance] = useState<number>(2000000); // Saldo awal kas
  const [dailyLimit] = useState<number>(150000);
  const [cryptoAssets] = useState<CryptoAsset[]>([]);
  
  // State transaksi global
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      title: 'Saldo Awal Modal',
      amount: 500000,
      type: 'inflow',
      category: 'Gaji',
      date: '20 Okt 2026',
    },
  ]);

  // Fungsi Tambah Transaksi
  const addTransaction = (newTxData: { title: string; amount: number; type: 'inflow' | 'outflow'; category: string }) => {
    const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    
    const newTx: Transaction = {
      id: Date.now().toString(),
      title: newTxData.title,
      amount: Number(newTxData.amount),
      type: newTxData.type,
      category: newTxData.category,
      date: todayStr,
    };

    // Buat array baru agar React mendeteksi perubahan state
    setTransactions((prev) => [newTx, ...prev]);
  };

  // Hitung Total Pemasukan & Pengeluaran secara otomatis
  const totalInflow = transactions
    .filter((t) => t.type === 'inflow')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalOutflow = transactions
    .filter((t) => t.type === 'outflow')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  // Saldo kas riil saat ini
  const cashBalance = initialBalance + totalInflow - totalOutflow;

  return (
    <FinanceContext.Provider
      value={{
        cashBalance,
        dailyLimit,
        transactions,
        cryptoAssets,
        addTransaction,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance harus digunakan di dalam FinanceProvider');
  }
  return context;
};