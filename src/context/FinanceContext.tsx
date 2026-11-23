import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { fetchCryptoPricesAsync, processTransactionWithThen } from '@/services/apiService';
import { CryptoAsset, Transaction } from '@/types';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

export type HistoryFilterType = 'all' | 'today' | '7days' | 'month' | 'custom';

interface QueryOptions {
  filter?: HistoryFilterType;
  keyword?: string;
  customDate?: string;
}

interface AddTransactionParams {
  title: string;
  amount: number;
  type: 'inflow' | 'outflow';
  category: string;
  assetType?: 'cash' | 'crypto';
  cryptoSymbol?: string;
  cryptoAmount?: number;
  transactionDate?: string;
}

interface FinanceContextType {
  cashBalance: number;
  dailyLimit: number;
  todayOutflow: number;
  totalTransactionCount: number;
  transactions: Transaction[];
  cryptoAssets: CryptoAsset[];
  isDarkMode: boolean;
  notificationsEnabled: boolean;
  isLoadingCrypto: boolean;
  isSyncingData: boolean;
  isLoadingMore: boolean;
  hasMoreTransactions: boolean;
  toggleDarkMode: () => void;
  toggleNotifications: () => void;
  addTransaction: (tx: AddTransactionParams) => Promise<void>;
  updateSettings: (newBalance: number, newLimit: number) => Promise<void>;
  resetData: () => Promise<void>;
  fetchLiveCrypto: () => Promise<void>;
  searchTransactionsServer: (options: QueryOptions) => Promise<void>;
  loadMoreTransactions: () => Promise<void>;
}

const PAGE_SIZE = 30;

const globalForFinance = globalThis as unknown as {
  FinanceContext?: React.Context<FinanceContextType | undefined>;
};

const FinanceContext =
  globalForFinance.FinanceContext ?? createContext<FinanceContextType | undefined>(undefined);

if (process.env.NODE_ENV !== 'production') {
  globalForFinance.FinanceContext = FinanceContext;
}

export const formatTanggalSekarang = (isoString?: string): string => {
  const dateObj = isoString ? new Date(isoString) : new Date();
  const tanggal = dateObj.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const jam = dateObj.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${tanggal} • ${jam}`;
};

export const toLocalDateKey = (dateInput: string | Date): string => {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [initialBalance, setInitialBalance] = useState<number>(0);
  const [dailyLimit, setDailyLimit] = useState<number>(150000);
  const [totalInflow, setTotalInflow] = useState<number>(0);
  const [totalOutflow, setTotalOutflow] = useState<number>(0);
  const [todayOutflow, setTodayOutflow] = useState<number>(0);
  const [totalTransactionCount, setTotalTransactionCount] = useState<number>(0);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [isLoadingCrypto, setIsLoadingCrypto] = useState<boolean>(false);
  const [isSyncingData, setIsSyncingData] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMoreTransactions, setHasMoreTransactions] = useState<boolean>(true);

  const [cryptoAssets, setCryptoAssets] = useState<CryptoAsset[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeQuery, setActiveQuery] = useState<QueryOptions>({
    filter: 'all',
    keyword: '',
    customDate: '',
  });

  const refreshServerSummary = useCallback(async () => {
    if (!user) return;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const { data, error } = await supabase.rpc('get_finance_summary', {
      p_user_id: user.id,
      p_today_start: startOfToday.toISOString(),
      p_today_end: endOfToday.toISOString(),
    });

    if (!error && data) {
      setTotalInflow(Number(data.total_inflow) || 0);
      setTotalOutflow(Number(data.total_outflow) || 0);
      setTodayOutflow(Number(data.today_outflow) || 0);
      setTotalTransactionCount(Number(data.total_count) || 0);
    }
  }, [user]);

  const fetchTransactionsPage = useCallback(
    async (pageIndex: number, options: QueryOptions, append: boolean) => {
      if (!user) return;

      const from = pageIndex * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (options.keyword && options.keyword.trim() !== '') {
        const kw = options.keyword.trim();
        query = query.or(`title.ilike.%${kw}%,category.ilike.%${kw}%`);
      }

      const now = new Date();
      if (options.filter === 'today') {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        query = query.gte('created_at', start.toISOString()).lte('created_at', end.toISOString());
      } else if (options.filter === '7days') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        query = query.gte('created_at', sevenDaysAgo.toISOString());
      } else if (options.filter === 'month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        query = query.gte('created_at', startOfMonth.toISOString());
      } else if (options.filter === 'custom' && options.customDate) {
        const cleanDate = options.customDate.trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
          const [y, m, d] = cleanDate.split('-').map(Number);
          const start = new Date(y, m - 1, d, 0, 0, 0, 0);
          const end = new Date(y, m - 1, d, 23, 59, 59, 999);
          query = query.gte('created_at', start.toISOString()).lte('created_at', end.toISOString());
        }
      }

      const { data, error } = await query;

      if (!error && data) {
        const mapped: Transaction[] = data.map((item) => ({
          id: item.id,
          title: item.title,
          amount: Number(item.amount),
          type: item.type as 'inflow' | 'outflow',
          category: item.category,
          date: formatTanggalSekarang(item.created_at),
          dateKey: toLocalDateKey(item.created_at),
        }));

        setHasMoreTransactions(mapped.length === PAGE_SIZE);
        setTransactions((prev) => (append ? [...prev, ...mapped] : mapped));
      }
    },
    [user]
  );

  useEffect(() => {
    if (user) {
      loadInitialUserData();
    } else {
      setTransactions([]);
      setCryptoAssets([]);
      setInitialBalance(0);
      setDailyLimit(150000);
      setTotalInflow(0);
      setTotalOutflow(0);
      setTodayOutflow(0);
      setTotalTransactionCount(0);
    }
  }, [user]);

  const loadInitialUserData = async () => {
    if (!user) return;
    try {
      setIsSyncingData(true);

      const { data: settingsData } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (settingsData) {
        setInitialBalance(Number(settingsData.initial_balance) || 0);
        setDailyLimit(Number(settingsData.daily_limit) || 150000);
      } else {
        await supabase.from('user_settings').insert({
          user_id: user.id,
          initial_balance: 0,
          daily_limit: 150000,
        });
      }

      await Promise.all([
        refreshServerSummary(),
        fetchTransactionsPage(0, { filter: 'all', keyword: '', customDate: '' }, false),
      ]);

      const { data: cryptoData } = await supabase
        .from('crypto_assets')
        .select('*')
        .eq('user_id', user.id);

      let loadedAssets: CryptoAsset[] = (cryptoData || []).map((c) => ({
        id: c.id,
        symbol: c.symbol,
        name: c.name,
        amount: Number(c.amount),
        priceIdr: Number(c.price_idr),
      }));

      try {
        const livePrices = await fetchCryptoPricesAsync();
        loadedAssets = loadedAssets.map((asset) => {
          const matched = livePrices.find((p) => p.symbol.toUpperCase() === asset.symbol.toUpperCase());
          return matched ? { ...asset, priceIdr: matched.priceIdr } : asset;
        });
      } catch {
        console.log('[FinanceContext] Menggunakan harga crypto tersimpan di database.');
      }

      setCryptoAssets(loadedAssets);
    } catch (error) {
      console.error('[Supabase Load Error]:', error);
    } finally {
      setIsSyncingData(false);
    }
  };

  const searchTransactionsServer = async (options: QueryOptions) => {
    setActiveQuery(options);
    setIsSyncingData(true);
    try {
      await fetchTransactionsPage(0, options, false);
    } finally {
      setIsSyncingData(false);
    }
  };

  const loadMoreTransactions = async () => {
    if (isLoadingMore || !hasMoreTransactions || isSyncingData) return;
    setIsLoadingMore(true);
    try {
      const nextPage = Math.floor(transactions.length / PAGE_SIZE);
      await fetchTransactionsPage(nextPage, activeQuery, true);
    } finally {
      setIsLoadingMore(false);
    }
  };

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
    } catch {
      console.log('[FinanceContext] Menggunakan harga fallback lokal.');
    } finally {
      setIsLoadingCrypto(false);
    }
  };

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);
  const toggleNotifications = () => setNotificationsEnabled((prev) => !prev);

  const addTransaction = async (newTxData: AddTransactionParams) => {
    if (!user) return;
    try {
      await processTransactionWithThen(newTxData.title, newTxData.amount);

      const targetTimestamp = newTxData.transactionDate || new Date().toISOString();
      const isCryptoTx = newTxData.assetType === 'crypto' && newTxData.cryptoSymbol;
      const finalCategory = isCryptoTx ? `Crypto (${newTxData.cryptoSymbol})` : newTxData.category;

      const { error: insertError } = await supabase.from('transactions').insert({
        user_id: user.id,
        title: newTxData.title,
        amount: Number(newTxData.amount),
        type: newTxData.type,
        category: finalCategory,
        asset_type: newTxData.assetType || 'cash',
        crypto_symbol: newTxData.cryptoSymbol || null,
        crypto_amount: newTxData.cryptoAmount || null,
        created_at: targetTimestamp,
      });

      if (insertError) throw insertError;

      await Promise.all([
        refreshServerSummary(),
        fetchTransactionsPage(0, activeQuery, false),
      ]);

      if (isCryptoTx && newTxData.cryptoSymbol && newTxData.cryptoAmount) {
        const symbolUpper = newTxData.cryptoSymbol.toUpperCase();
        const coinQty = Number(newTxData.cryptoAmount);
        const unitPriceIdr = Number(newTxData.amount) / coinQty;
        const coinName =
          symbolUpper === 'BTC' ? 'Bitcoin' :
          symbolUpper === 'ETH' ? 'Ethereum' :
          symbolUpper === 'SOL' ? 'Solana' : symbolUpper;

        const existingAsset = cryptoAssets.find((c) => c.symbol.toUpperCase() === symbolUpper);
        const currentQty = existingAsset ? existingAsset.amount : 0;
        const updatedQty = newTxData.type === 'inflow'
          ? currentQty + coinQty
          : Math.max(0, currentQty - coinQty);

        if (updatedQty > 0) {
          const { data: upsertedCrypto, error: cryptoError } = await supabase
            .from('crypto_assets')
            .upsert(
              {
                user_id: user.id,
                symbol: symbolUpper,
                name: coinName,
                amount: updatedQty,
                price_idr: unitPriceIdr,
                updated_at: targetTimestamp,
              },
              { onConflict: 'user_id,symbol' }
            )
            .select()
            .single();

          if (!cryptoError && upsertedCrypto) {
            setCryptoAssets((prev) => {
              const filtered = prev.filter((c) => c.symbol.toUpperCase() !== symbolUpper);
              return [
                ...filtered,
                {
                  id: upsertedCrypto.id,
                  symbol: upsertedCrypto.symbol,
                  name: upsertedCrypto.name,
                  amount: Number(upsertedCrypto.amount),
                  priceIdr: Number(upsertedCrypto.price_idr),
                },
              ];
            });
          }
        } else {
          await supabase
            .from('crypto_assets')
            .delete()
            .eq('user_id', user.id)
            .eq('symbol', symbolUpper);

          setCryptoAssets((prev) => prev.filter((c) => c.symbol.toUpperCase() !== symbolUpper));
        }
      }
    } catch (error: any) {
      console.error('[AddTransaction Supabase Error]:', error);
      Alert.alert('Gagal Menyimpan', error?.message || 'Tidak dapat menyimpan transaksi ke database.');
    }
  };

  const cashBalance = initialBalance + totalInflow - totalOutflow;

  const updateSettings = async (newBalance: number, newLimit: number) => {
    if (!user) return;
    try {
      const adjustedInitialBalance = newBalance - (totalInflow - totalOutflow);

      const { error } = await supabase.from('user_settings').upsert({
        user_id: user.id,
        initial_balance: adjustedInitialBalance,
        daily_limit: newLimit,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      setInitialBalance(adjustedInitialBalance);
      setDailyLimit(newLimit);
    } catch (error) {
      console.error('[UpdateSettings Supabase Error]:', error);
      Alert.alert('Gagal Menyimpan', 'Pengaturan gagal disimpan ke server.');
    }
  };

  const resetData = async () => {
    if (!user) return;
    try {
      await supabase.from('transactions').delete().eq('user_id', user.id);
      await supabase.from('crypto_assets').delete().eq('user_id', user.id);
      await supabase.from('user_settings').upsert({
        user_id: user.id,
        initial_balance: 0,
        daily_limit: 150000,
        updated_at: new Date().toISOString(),
      });

      setTransactions([]);
      setCryptoAssets([]);
      setInitialBalance(0);
      setDailyLimit(150000);
      setTotalInflow(0);
      setTotalOutflow(0);
      setTodayOutflow(0);
      setTotalTransactionCount(0);
    } catch (error) {
      console.error('[ResetData Supabase Error]:', error);
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        cashBalance,
        dailyLimit,
        todayOutflow,
        totalTransactionCount,
        transactions,
        cryptoAssets,
        isDarkMode,
        notificationsEnabled,
        isLoadingCrypto,
        isSyncingData,
        isLoadingMore,
        hasMoreTransactions,
        toggleDarkMode,
        toggleNotifications,
        addTransaction,
        updateSettings,
        resetData,
        fetchLiveCrypto,
        searchTransactionsServer,
        loadMoreTransactions,
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