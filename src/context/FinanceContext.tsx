import { fetchCryptoPricesAsync, processTransactionWithThen } from '@/services/apiService';
import { CryptoAsset, Transaction } from '@/types';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AddTransactionParams {
  title: string;
  amount: number;
  type: 'inflow' | 'outflow';
  category: string;
  assetType?: 'cash' | 'crypto';
  cryptoSymbol?: string;
  cryptoAmount?: number;
}

interface FinanceContextType {
  cashBalance: number;
  dailyLimit: number;
  transactions: Transaction[];
  cryptoAssets: CryptoAsset[];
  isDarkMode: boolean;
  notificationsEnabled: boolean;
  isLoadingCrypto: boolean;
  toggleDarkMode: () => void;
  toggleNotifications: () => void;
  addTransaction: (tx: AddTransactionParams) => void;
  updateSettings: (newBalance: number, newLimit: number) => void;
  resetData: () => void;
  fetchLiveCrypto: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [initialBalance, setInitialBalance] = useState<number>(2000000);
  const [dailyLimit, setDailyLimit] = useState<number>(150000);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [isLoadingCrypto, setIsLoadingCrypto] = useState<boolean>(false);
  
  // State Aset Crypto (Dapat bertambah/berkurang lewat transaksi)
  const [cryptoAssets, setCryptoAssets] = useState<CryptoAsset[]>([]);

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

  useEffect(() => {
    fetchLiveCrypto();
  }, []);

  const fetchLiveCrypto = async () => {
    try {
      setIsLoadingCrypto(true);
      const livePrices = await fetchCryptoPricesAsync();

      setCryptoAssets((prevAssets) =>
        prevAssets.map((asset) => {
          const matched = livePrices.find((p) => p.symbol.toUpperCase() === asset.symbol.toUpperCase());
          return matched ? { ...asset, priceIdr: matched.priceIdr } : asset;
        })
      );
    } catch (error) {
      console.log('[FinanceContext] Menggunakan data fallback lokal.');
    } finally {
      setIsLoadingCrypto(false);
    }
  };

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);
  const toggleNotifications = () => setNotificationsEnabled((prev) => !prev);

  // Tambah Transaksi Kas atau Crypto
  const addTransaction = (newTxData: AddTransactionParams) => {
    processTransactionWithThen(newTxData.title, newTxData.amount)
      .then(() => {
        const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

        const isCryptoTx = newTxData.assetType === 'crypto' && newTxData.cryptoSymbol;

        const newTx: Transaction = {
          id: Date.now().toString(),
          title: newTxData.title,
          amount: Number(newTxData.amount),
          type: newTxData.type,
          category: isCryptoTx ? `Crypto (${newTxData.cryptoSymbol})` : newTxData.category,
          date: todayStr,
        };

        // 1. Simpan Transaksi ke Riwayat
        setTransactions((prev) => [newTx, ...prev]);

        // 2. Update Portofolio Crypto jika jenis transaksi adalah Crypto
        if (isCryptoTx && newTxData.cryptoSymbol && newTxData.cryptoAmount) {
          const symbolUpper = newTxData.cryptoSymbol.toUpperCase();
          const coinQty = Number(newTxData.cryptoAmount);
          const estimatedPriceIdr = newTxData.amount / coinQty;

          setCryptoAssets((prevCrypto) => {
            const existingIndex = prevCrypto.findIndex((c) => c.symbol.toUpperCase() === symbolUpper);

            if (existingIndex >= 0) {
              const updated = [...prevCrypto];
              const currentItem = updated[existingIndex];
              const newAmount = newTxData.type === 'inflow' 
                ? currentItem.amount + coinQty 
                : Math.max(0, currentItem.amount - coinQty);

              updated[existingIndex] = {
                ...currentItem,
                amount: newAmount,
                priceIdr: estimatedPriceIdr || currentItem.priceIdr,
              };
              return updated.filter((c) => c.amount > 0);
            } else {
              if (newTxData.type === 'outflow') return prevCrypto;
              return [
                ...prevCrypto,
                {
                  id: Date.now().toString(),
                  name: symbolUpper === 'BTC' ? 'Bitcoin' : symbolUpper === 'ETH' ? 'Ethereum' : symbolUpper,
                  symbol: symbolUpper,
                  amount: coinQty,
                  priceIdr: estimatedPriceIdr || 500000000,
                },
              ];
            }
          });
        }
      })
      .catch((err) => {
        console.error('[AddTransaction Rejected]:', err);
      });
  };

  const updateSettings = (newBalance: number, newLimit: number) => {
    setInitialBalance(newBalance);
    setDailyLimit(newLimit);
  };

  const resetData = () => {
    setTransactions([]);
    setCryptoAssets([]);
    setInitialBalance(0);
    setDailyLimit(150000);
  };

  // Hanya hitung transaksi non-crypto ke dalam Kas Fisik (Kas tidak terpotong jika beli Crypto)
  const totalInflow = transactions
    .filter((t) => t.type === 'inflow' && !t.category.startsWith('Crypto'))
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalOutflow = transactions
    .filter((t) => t.type === 'outflow' && !t.category.startsWith('Crypto'))
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const cashBalance = initialBalance + totalInflow - totalOutflow;

  return (
    <FinanceContext.Provider
      value={{
        cashBalance,
        dailyLimit,
        transactions,
        cryptoAssets,
        isDarkMode,
        notificationsEnabled,
        isLoadingCrypto,
        toggleDarkMode,
        toggleNotifications,
        addTransaction,
        updateSettings,
        resetData,
        fetchLiveCrypto,
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