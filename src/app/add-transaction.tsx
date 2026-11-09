import { useFinance } from '@/context/FinanceContext';
import { fetchCryptoPricesAsync } from '@/services/apiService';
import { formatRupiah } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const OUTFLOW_CATEGORIES = [
  { id: 'Kuliner', label: 'Kuliner', icon: 'fast-food-outline' as const },
  { id: 'Transport', label: 'Transport', icon: 'car-outline' as const },
  { id: 'Belanja', label: 'Belanja', icon: 'cart-outline' as const },
  { id: 'Tagihan', label: 'Tagihan', icon: 'receipt-outline' as const },
  { id: 'Lainnya', label: 'Lainnya', icon: 'grid-outline' as const },
];

const INFLOW_CATEGORIES = [
  { id: 'Gaji', label: 'Gaji', icon: 'cash-outline' as const },
  { id: 'Freelance', label: 'Freelance', icon: 'laptop-outline' as const },
  { id: 'Bonus', label: 'Bonus', icon: 'gift-outline' as const },
  { id: 'Lainnya', label: 'Lainnya', icon: 'add-circle-outline' as const },
];

const CRYPTO_TOKENS = [
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'SOL', name: 'Solana' },
  { symbol: 'USDT', name: 'Tether' },
];

export default function AddTransactionScreen() {
  const router = useRouter();
  const { addTransaction, isDarkMode } = useFinance();

  const [assetType, setAssetType] = useState<'cash' | 'crypto'>('cash');
  const [type, setType] = useState<'inflow' | 'outflow'>('outflow');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Kuliner');

  // State khusus Crypto & Live Price API
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [livePrices, setLivePrices] = useState<Record<string, number>>({
    BTC: 1400000000,
    ETH: 55000000,
    SOL: 2800000,
    USDT: 16000,
  });

  // 1. Fetch Harga Live dari API saat beralih ke tab Crypto
  useEffect(() => {
    if (assetType === 'crypto') {
      loadLivePrices();
    }
  }, [assetType]);

  const loadLivePrices = async () => {
    try {
      setLoadingPrice(true);
      const prices = await fetchCryptoPricesAsync();
      const priceMap: Record<string, number> = {};
      prices.forEach((p) => {
        priceMap[p.symbol.toUpperCase()] = p.priceIdr;
      });
      setLivePrices((prev) => ({ ...prev, ...priceMap }));
    } catch (err) {
      console.log('Menggunakan harga estimasi fallback lokal.');
    } finally {
      setLoadingPrice(false);
    }
  };

  // 2. Auto-Kalkulasi Total Nilai (Rp) saat Jumlah Coin Berubah
  const handleCryptoAmountChange = (text: string) => {
    setCryptoAmount(text);
    const parsedQty = parseFloat(text);
    const currentUnitPrice = livePrices[selectedCrypto.toUpperCase()] || 0;

    if (!isNaN(parsedQty) && parsedQty > 0 && currentUnitPrice > 0) {
      const calculatedTotal = Math.round(parsedQty * currentUnitPrice);
      setAmount(calculatedTotal.toString());
    } else if (text === '') {
      setAmount('');
    }
  };

  // 3. Auto-Kalkulasi Ulang saat Pindah Pilihan Token
  const handleSelectToken = (symbol: string) => {
    setSelectedCrypto(symbol);
    const parsedQty = parseFloat(cryptoAmount);
    const currentUnitPrice = livePrices[symbol.toUpperCase()] || 0;

    if (!isNaN(parsedQty) && parsedQty > 0 && currentUnitPrice > 0) {
      const calculatedTotal = Math.round(parsedQty * currentUnitPrice);
      setAmount(calculatedTotal.toString());
    }
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/' as any);
    }
  };

  const handleQuickAddAmount = (addValue: number) => {
    const cleanCurrent = parseInt(amount.replace(/[^0-9]/g, ''), 10) || 0;
    setAmount((cleanCurrent + addValue).toString());
  };

  const handleSave = () => {
    const cleanAmountStr = amount.replace(/[^0-9]/g, '');
    const numericAmount = parseInt(cleanAmountStr, 10);

    const defaultTitle = assetType === 'crypto' 
      ? `${type === 'inflow' ? 'Beli' : 'Jual'} ${selectedCrypto}` 
      : title;

    if (assetType === 'cash' && !title.trim()) {
      Alert.alert('Perhatian', 'Harap isi keterangan transaksi.');
      return;
    }

    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Perhatian', 'Masukkan total nilai nominal Rupiah yang valid.');
      return;
    }

    if (assetType === 'crypto') {
      const numericCoin = parseFloat(cryptoAmount);
      if (isNaN(numericCoin) || numericCoin <= 0) {
        Alert.alert('Perhatian', 'Masukkan jumlah coin/token crypto yang valid.');
        return;
      }
    }

    addTransaction({
      title: defaultTitle.trim(),
      amount: numericAmount,
      type,
      category,
      assetType,
      cryptoSymbol: selectedCrypto,
      cryptoAmount: assetType === 'crypto' ? parseFloat(cryptoAmount) : undefined,
    });

    handleGoBack();
  };

  const categories = type === 'outflow' ? OUTFLOW_CATEGORIES : INFLOW_CATEGORIES;
  const activeUnitPrice = livePrices[selectedCrypto.toUpperCase()] || 0;

  return (
    <SafeAreaView style={[styles.container, isDarkMode && { backgroundColor: '#0f172a' }]}>
      {/* HEADER */}
      <View style={[styles.header, { borderBottomColor: isDarkMode ? '#334155' : '#f1f5f9' }]}>
        <Pressable onPress={handleGoBack} style={[styles.backButton, isDarkMode && { backgroundColor: '#1e293b' }]}>
          <Ionicons name="arrow-back" size={22} color={isDarkMode ? '#ffffff' : '#0f172a'} />
        </Pressable>
        <Text style={[styles.headerTitle, isDarkMode && { color: '#ffffff' }]}>Catat Transaksi</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
        
        {/* PILIHAN DOMPET: KAS vs CRYPTO */}
        <Text style={[styles.label, isDarkMode && { color: '#cbd5e1' }]}>Pilih Dompet / Akun</Text>
        <View style={styles.walletSelectorContainer}>
          <Pressable
            style={[styles.walletChip, assetType === 'cash' && styles.walletChipActive]}
            onPress={() => setAssetType('cash')}
          >
            <Ionicons name="wallet-outline" size={16} color={assetType === 'cash' ? '#ffffff' : '#64748b'} />
            <Text style={[styles.walletChipText, assetType === 'cash' && styles.walletChipTextActive]}>Kas (Rupiah)</Text>
          </Pressable>

          <Pressable
            style={[styles.walletChip, assetType === 'crypto' && styles.walletChipActiveCrypto]}
            onPress={() => setAssetType('crypto')}
          >
            <Ionicons name="logo-bitcoin" size={16} color={assetType === 'crypto' ? '#ffffff' : '#64748b'} />
            <Text style={[styles.walletChipText, assetType === 'crypto' && styles.walletChipTextActive]}>Aset Crypto</Text>
          </Pressable>
        </View>

        {/* TOGGLE PEMASUKAN / PENGELUARAN */}
        <View style={styles.typeSelectorContainer}>
          <Pressable
            style={[styles.typeSegment, type === 'outflow' && styles.typeSegmentOutflow]}
            onPress={() => setType('outflow')}
          >
            <Ionicons name="arrow-up-circle-outline" size={18} color={type === 'outflow' ? '#dc2626' : '#64748b'} />
            <Text style={[styles.typeSegmentText, type === 'outflow' && styles.typeTextOutflow]}>
              {assetType === 'crypto' ? 'Jual / Tarik (-)' : 'Pengeluaran (-)'}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.typeSegment, type === 'inflow' && styles.typeSegmentInflow]}
            onPress={() => setType('inflow')}
          >
            <Ionicons name="arrow-down-circle-outline" size={18} color={type === 'inflow' ? '#16a34a' : '#64748b'} />
            <Text style={[styles.typeSegmentText, type === 'inflow' && styles.typeTextInflow]}>
              {assetType === 'crypto' ? 'Beli / Deposit (+)' : 'Pemasukan (+)'}
            </Text>
          </Pressable>
        </View>

        {/* SEKSI KHUSUS CRYPTO WITH LIVE PRICE AUTO-CALCULATE */}
        {assetType === 'crypto' && (
          <View style={[styles.cryptoSection, isDarkMode && { backgroundColor: '#1e293b', borderColor: '#334155' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={[styles.label, { marginBottom: 0 }, isDarkMode && { color: '#cbd5e1' }]}>Pilih Token Crypto</Text>
              {loadingPrice && <ActivityIndicator size="small" color="#f59e0b" />}
            </View>

            <View style={styles.tokenRow}>
              {CRYPTO_TOKENS.map((token) => (
                <Pressable
                  key={token.symbol}
                  style={[styles.tokenChip, selectedCrypto === token.symbol && styles.tokenChipSelected]}
                  onPress={() => handleSelectToken(token.symbol)}
                >
                  <Text style={[styles.tokenChipText, selectedCrypto === token.symbol && styles.tokenChipTextSelected]}>
                    {token.symbol}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* HARGA LIVE BADGE */}
            <View style={styles.livePriceBadge}>
              <Ionicons name="stats-chart-outline" size={14} color="#d97706" />
              <Text style={styles.livePriceText}>
                Harga Live {selectedCrypto}: <Text style={{ fontWeight: 'bold' }}>{formatRupiah(activeUnitPrice)}</Text>
              </Text>
            </View>

            {/* INPUT JUMLAH COIN */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isDarkMode && { color: '#cbd5e1' }]}>Jumlah Coin ({selectedCrypto})</Text>
              <View style={[styles.amountInputRow, isDarkMode && { backgroundColor: '#0f172a', borderColor: '#475569' }]}>
                <TextInput
                  style={[styles.amountInput, isDarkMode && { color: '#ffffff' }]}
                  placeholder="Contoh: 0.005"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  value={cryptoAmount}
                  onChangeText={handleCryptoAmountChange}
                />
                <Text style={{ fontWeight: 'bold', color: '#64748b' }}>{selectedCrypto}</Text>
              </View>
            </View>
          </View>
        )}

        {/* INPUT TOTAL NILAI RUPIAH (OTOMATIS TERISI DARI HARGA LIVE) */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, isDarkMode && { color: '#cbd5e1' }]}>
            {assetType === 'crypto' ? 'Total Nilai Aset Terhitung (Rp)' : 'Nominal Transaksi (Rp)'}
          </Text>
          <View style={[styles.amountInputRow, isDarkMode && { backgroundColor: '#1e293b', borderColor: '#334155' }]}>
            <Text style={[styles.currencyPrefix, isDarkMode && { color: '#ffffff' }]}>Rp</Text>
            <TextInput
              style={[styles.amountInput, isDarkMode && { color: '#ffffff' }]}
              placeholder="0"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
        </View>

        {/* PRESET NOMINAL CEPAT (KAS ONLY) */}
        {assetType === 'cash' && (
          <View style={styles.quickAmountRow}>
            <Pressable style={styles.quickChip} onPress={() => handleQuickAddAmount(10000)}>
              <Text style={styles.quickChipText}>+10rb</Text>
            </Pressable>
            <Pressable style={styles.quickChip} onPress={() => handleQuickAddAmount(20000)}>
              <Text style={styles.quickChipText}>+20rb</Text>
            </Pressable>
            <Pressable style={styles.quickChip} onPress={() => handleQuickAddAmount(50000)}>
              <Text style={styles.quickChipText}>+50rb</Text>
            </Pressable>
            <Pressable style={styles.quickChip} onPress={() => handleQuickAddAmount(100000)}>
              <Text style={styles.quickChipText}>+100rb</Text>
            </Pressable>
          </View>
        )}

        {/* PILIHAN KATEGORI (KAS ONLY) */}
        {assetType === 'cash' && (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDarkMode && { color: '#cbd5e1' }]}>Kategori</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContainer}>
              {categories.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <Pressable
                    key={cat.id}
                    style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                    onPress={() => setCategory(cat.id)}
                  >
                    <Ionicons name={cat.icon} size={16} color={isSelected ? '#ffffff' : '#64748b'} />
                    <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextSelected]}>
                      {cat.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* KETERANGAN TRANSAKSI */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, isDarkMode && { color: '#cbd5e1' }]}>Keterangan / Catatan</Text>
          <View style={[styles.textInputWrapper, isDarkMode && { backgroundColor: '#1e293b', borderColor: '#334155' }]}>
            <Ionicons name="create-outline" size={20} color="#94a3b8" style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.textInput, isDarkMode && { color: '#ffffff' }]}
              placeholder={assetType === 'crypto' ? `${type === 'inflow' ? 'Beli' : 'Jual'} ${selectedCrypto}` : 'Contoh: Nasi Goreng & Es Teh'}
              placeholderTextColor="#94a3b8"
              value={title}
              onChangeText={setTitle}
            />
          </View>
        </View>

        {/* TOMBOL AKSI */}
        <View style={styles.actions}>
          <Pressable style={styles.cancelButton} onPress={handleGoBack}>
            <Text style={styles.cancelText}>Batal</Text>
          </Pressable>
          <Pressable
            style={[styles.submitButton, type === 'inflow' ? styles.submitInflow : styles.submitOutflow]}
            onPress={handleSave}
          >
            <Ionicons name="checkmark-sharp" size={20} color="white" style={{ marginRight: 6 }} />
            <Text style={styles.submitText}>Simpan Transaksi</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  formContent: { padding: 20 },

  walletSelectorContainer: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  walletChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12, backgroundColor: '#f1f5f9' },
  walletChipActive: { backgroundColor: '#0f172a' },
  walletChipActiveCrypto: { backgroundColor: '#f59e0b' },
  walletChipText: { fontSize: 13, fontWeight: 'bold', color: '#64748b' },
  walletChipTextActive: { color: '#ffffff' },

  typeSelectorContainer: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 14, padding: 4, marginBottom: 20 },
  typeSegment: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, gap: 6 },
  typeSegmentOutflow: { backgroundColor: '#ffffff', elevation: 1 },
  typeSegmentInflow: { backgroundColor: '#ffffff', elevation: 1 },
  typeSegmentText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  typeTextOutflow: { color: '#dc2626' },
  typeTextInflow: { color: '#16a34a' },

  cryptoSection: { marginBottom: 16, backgroundColor: '#fffbebfb', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#fef3c7' },
  tokenRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  tokenChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#fde68a' },
  tokenChipSelected: { backgroundColor: '#f59e0b', borderColor: '#f59e0b' },
  tokenChipText: { fontSize: 13, fontWeight: 'bold', color: '#d97706' },
  tokenChipTextSelected: { color: '#ffffff' },

  livePriceBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fef3c7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginBottom: 14 },
  livePriceText: { fontSize: 11, color: '#92400e' },

  inputGroup: { marginBottom: 18 },
  label: { fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 8 },
  amountInputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10 },
  currencyPrefix: { fontSize: 22, fontWeight: 'bold', color: '#0f172a', marginRight: 8 },
  amountInput: { flex: 1, fontSize: 18, fontWeight: 'bold', color: '#0f172a' },

  quickAmountRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  quickChip: { flex: 1, backgroundColor: '#f1f5f9', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  quickChipText: { fontSize: 12, fontWeight: '600', color: '#475569' },

  categoryContainer: { gap: 8, paddingVertical: 2 },
  categoryChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, gap: 6 },
  categoryChipSelected: { backgroundColor: '#0f172a', borderColor: '#0f172a' },
  categoryChipText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  categoryChipTextSelected: { color: '#ffffff' },

  textInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  textInput: { flex: 1, fontSize: 14, color: '#0f172a' },

  actions: { flexDirection: 'row', gap: 12, marginTop: 12 },
  cancelButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: '#f1f5f9' },
  cancelText: { color: '#64748b', fontWeight: 'bold' },
  submitButton: { flex: 2, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, borderRadius: 12 },
  submitOutflow: { backgroundColor: '#0f172a' },
  submitInflow: { backgroundColor: '#16a34a' },
  submitText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
});