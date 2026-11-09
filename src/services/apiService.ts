
// ============================================================================
// 1. INTERFACE UNTUK MENAMPUNG OBJECT DARI EXTERNAL API (Kriteria 1 - 10%)
// ============================================================================
export interface ExternalCryptoPrice {
  symbol: string;
  name: string;
  priceIdr: number;
  lastUpdated: string;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
}

// Interface Tambahan untuk Data Grafik Crypto
export interface CryptoPricePoint {
  timestamp: number;
  price: number;
}

export interface CryptoHistoryData {
  coinId: string;
  prices: CryptoPricePoint[];
  minPrice: number;
  maxPrice: number;
  changePercentage: number;
}

// ============================================================================
// 2. CUSTOM & PRE-BUILT ASYNC FUNCTION (Kriteria 2 - 10%)
// ============================================================================
/**
 * Pre-built async function yang digunakan: `fetch()` & `response.json()`
 * Custom async function: `fetchCryptoPricesAsync` & `fetchCryptoHistoryAsync`
 */
export const fetchCryptoPricesAsync = async (): Promise<ExternalCryptoPrice[]> => {
  try {
    // Pre-built Async Function (fetch)
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,tether&vs_currencies=idr'
    );

    if (!response.ok) {
      throw new Error('Gagal mengambil data dari API eksternal');
    }

    const rawData = await response.json();

    // Memasukkan data External API ke dalam Array of Object ber-Interface ExternalCryptoPrice
    const formattedData: ExternalCryptoPrice[] = [
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        priceIdr: rawData.bitcoin?.idr || 0,
        lastUpdated: new Date().toLocaleTimeString('id-ID'),
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        priceIdr: rawData.ethereum?.idr || 0,
        lastUpdated: new Date().toLocaleTimeString('id-ID'),
      },
      {
        symbol: 'SOL',
        name: 'Solana',
        priceIdr: rawData.solana?.idr || 0,
        lastUpdated: new Date().toLocaleTimeString('id-ID'),
      },
      {
        symbol: 'USDT',
        name: 'Tether',
        priceIdr: rawData.tether?.idr || 0,
        lastUpdated: new Date().toLocaleTimeString('id-ID'),
      },
    ];

    return formattedData;
  } catch (error) {
    console.error('[Async Fetch Prices Error]:', error);
    throw error;
  }
};

/**
 * Custom Async Function Tambahan: Mengambil histori harga crypto untuk Chart
 */
export const fetchCryptoHistoryAsync = async (
  coinId: string = 'bitcoin',
  days: number = 7
): Promise<CryptoHistoryData> => {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=idr&days=${days}`
    );

    if (!response.ok) {
      throw new Error(`Gagal mengambil histori grafik (${response.status})`);
    }

    const data = await response.json();
    const rawPrices: [number, number][] = data.prices || [];

    const prices: CryptoPricePoint[] = rawPrices.map(([timestamp, price]) => ({
      timestamp,
      price: Math.round(price),
    }));

    const priceValues = prices.map((p) => p.price);
    const minPrice = priceValues.length > 0 ? Math.min(...priceValues) : 0;
    const maxPrice = priceValues.length > 0 ? Math.max(...priceValues) : 0;

    const firstPrice = priceValues[0] || 1;
    const lastPrice = priceValues[priceValues.length - 1] || 1;
    const changePercentage = ((lastPrice - firstPrice) / firstPrice) * 100;

    return {
      coinId,
      prices,
      minPrice,
      maxPrice,
      changePercentage,
    };
  } catch (error) {
    console.error(`[Async Fetch Chart Error - ${coinId}]:`, error);
    throw error;
  }
};

// ============================================================================
// 3. FUNGSI .then(), .resolve(), DAN .reject() (Kriteria 3 - 10%)
// ============================================================================
/**
 * Fungsi validasi yang mengembalikan Promise manual menggunakan resolve() dan reject()
 */
export const validateTransactionPromise = (
  title: string,
  amount: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!title || title.trim() === '') {
      // Menggunakan reject()
      return reject('Keterangan transaksi tidak boleh kosong!');
    }

    if (isNaN(amount) || amount <= 0) {
      // Menggunakan reject()
      return reject('Nominal transaksi harus lebih besar dari 0!');
    }

    // Menggunakan resolve()
    return resolve('Validasi transaksi berhasil disetujui.');
  });
};

/**
 * Memproses transaksi menggunakan chaining method .then() dan .catch()
 */
export const processTransactionWithThen = (title: string, amount: number) => {
  return validateTransactionPromise(title, amount)
    .then((successMessage) => {
      console.log('[.then() Resolved]:', successMessage);
      // Menggunakan Promise.resolve()
      return Promise.resolve({ success: true, message: successMessage });
    })
    .catch((errorMessage) => {
      console.error('[.then() Rejected]:', errorMessage);
      // Menggunakan Promise.reject()
      return Promise.reject({ success: false, message: errorMessage });
    });
};