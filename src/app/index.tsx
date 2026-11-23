import { CryptoItem } from '@/components/CryptoItem';
import { useAuth } from '@/context/AuthContext';
import { HistoryFilterType, useFinance } from '@/context/FinanceContext';
import { Transaction } from '@/types';
import { formatRupiah } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    cashBalance,
    dailyLimit,
    todayOutflow,
    totalTransactionCount,
    transactions,
    cryptoAssets,
    isDarkMode,
    isLoadingCrypto,
    isSyncingData,
    isLoadingMore,
    hasMoreTransactions,
    fetchLiveCrypto,
    searchTransactionsServer,
    loadMoreTransactions,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'history' | 'crypto'>('history');
  const [historyFilter, setHistoryFilter] = useState<HistoryFilterType>('all');
  const [searchDate, setSearchDate] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Debounce pencarian ke server Supabase (400ms) agar tidak mengirim request tiap ketukan huruf
  useEffect(() => {
    const timer = setTimeout(() => {
      searchTransactionsServer({
        filter: historyFilter,
        keyword: searchKeyword,
        customDate: searchDate,
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [historyFilter, searchKeyword, searchDate]);

  const totalCryptoValue = cryptoAssets.reduce(
    (sum, asset) => sum + asset.amount * asset.priceIdr,
    0
  );

  const totalNetWorth = cashBalance + totalCryptoValue;
  const remainingDailyBudget = Math.max(0, dailyLimit - todayOutflow);
  const budgetProgress = Math.min(100, (todayOutflow / (dailyLimit || 1)) * 100);

  const themeBg = isDarkMode ? '#0f172a' : '#f8fafc';
  const themeCard = isDarkMode ? '#1e293b' : '#ffffff';
  const themeText = isDarkMode ? '#f8fafc' : '#0f172a';
  const themeSubtext = isDarkMode ? '#94a3b8' : '#64748b';
  const themeBorder = isDarkMode ? '#334155' : '#f1f5f9';

  const headerSection = (
    <View>
      {/* SUMMARY CARD */}
      <View style={styles.summaryCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.netWorthLabel}>Total Kekayaan (Kas + Crypto)</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>
              {totalTransactionCount.toLocaleString('id-ID')} Transaksi
            </Text>
          </View>
        </View>

        <Text style={styles.netWorthValue}>{formatRupiah(totalNetWorth)}</Text>

        <View style={styles.walletSplitRow}>
          <View style={styles.walletBox}>
            <Text style={styles.walletBoxLabel}>Saldo Kas</Text>
            <Text style={styles.walletBoxAmount}>{formatRupiah(cashBalance)}</Text>
          </View>
          <View style={styles.walletDivider} />
          <View style={styles.walletBox}>
            <Text style={styles.walletBoxLabel}>Portofolio Crypto</Text>
            <Text style={[styles.walletBoxAmount, { color: '#fbbf24' }]}>
              {formatRupiah(totalCryptoValue)}
            </Text>
          </View>
        </View>

        <View style={styles.dailyBudgetBox}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={styles.dailyBudgetLabel}>Sisa Batas Belanja Hari Ini</Text>
            <Text style={styles.dailyBudgetAmount}>{formatRupiah(remainingDailyBudget)}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${budgetProgress}%`,
                  backgroundColor: budgetProgress >= 90 ? '#ef4444' : '#38bdf8',
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* TAB SWITCHER */}
      <View style={[styles.tabContainer, { backgroundColor: isDarkMode ? '#1e293b' : '#e2e8f0' }]}>
        <Pressable
          style={[styles.tabButton, activeTab === 'history' && { backgroundColor: themeCard }]}
          onPress={() => setActiveTab('history')}
        >
          <Ionicons
            name="receipt-outline"
            size={16}
            color={activeTab === 'history' ? themeText : themeSubtext}
          />
          <Text style={[styles.tabText, { color: activeTab === 'history' ? themeText : themeSubtext }]}>
            Riwayat Transaksi
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tabButton, activeTab === 'crypto' && { backgroundColor: themeCard }]}
          onPress={() => setActiveTab('crypto')}
        >
          <Ionicons
            name="logo-bitcoin"
            size={16}
            color={activeTab === 'crypto' ? '#f59e0b' : themeSubtext}
          />
          <Text style={[styles.tabText, { color: activeTab === 'crypto' ? themeText : themeSubtext }]}>
            Portofolio Crypto
          </Text>
        </Pressable>
      </View>

      {/* BILAH PENCARIAN & FILTER TANGGAL */}
      {activeTab === 'history' && (
        <View style={{ marginBottom: 14 }}>
          <View style={[styles.searchBar, { backgroundColor: themeCard, borderColor: themeBorder }]}>
            <Ionicons name="search-outline" size={18} color="#94a3b8" style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.searchInput, { color: themeText }]}
              placeholder={
                historyFilter === 'custom'
                  ? 'Ketik tanggal lengkap (YYYY-MM-DD)...'
                  : 'Cari 100.000+ riwayat transaksi...'
              }
              placeholderTextColor="#94a3b8"
              value={historyFilter === 'custom' ? searchDate : searchKeyword}
              onChangeText={(val) => {
                if (historyFilter === 'custom') setSearchDate(val);
                else setSearchKeyword(val);
              }}
            />
            {(searchKeyword !== '' || searchDate !== '') && (
              <Pressable
                onPress={() => {
                  setSearchKeyword('');
                  setSearchDate('');
                }}
              >
                <Ionicons name="close-circle" size={18} color="#94a3b8" />
              </Pressable>
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {[
              { id: 'all', label: 'Semua' },
              { id: 'today', label: 'Hari Ini' },
              { id: '7days', label: '7 Hari' },
              { id: 'month', label: 'Bulan Ini' },
              { id: 'custom', label: 'Pilih Tanggal' },
            ].map((item) => {
              const active = historyFilter === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setHistoryFilter(item.id as HistoryFilterType)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: active
                        ? '#0f172a'
                        : isDarkMode
                        ? '#1e293b'
                        : '#e2e8f0',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: active ? '#ffffff' : themeSubtext },
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );

  const renderTransactionItem = ({ item: tx }: { item: Transaction }) => {
    const isInflow = tx.type === 'inflow';
    return (
      <View style={[styles.txCard, { backgroundColor: themeCard, borderColor: themeBorder }]}>
        <View
          style={[
            styles.txIconBox,
            { backgroundColor: isInflow ? '#dcfce7' : '#fee2e2' },
          ]}
        >
          <Ionicons
            name={isInflow ? 'arrow-down' : 'arrow-up'}
            size={18}
            color={isInflow ? '#16a34a' : '#dc2626'}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.txTitle, { color: themeText }]}>{tx.title}</Text>
          <Text style={[styles.txMeta, { color: themeSubtext }]}>
            {tx.category} • {tx.date}
          </Text>
        </View>

        <Text style={[styles.txAmount, { color: isInflow ? '#16a34a' : '#dc2626' }]}>
          {isInflow ? '+' : '-'}
          {formatRupiah(tx.amount)}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeBg }]}>
      {/* TOP BAR */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.brandTitle, { color: themeText }]}>JagaKas</Text>
          <Text style={[styles.userEmailText, { color: themeSubtext }]} numberOfLines={1}>
            {user?.email || 'Dompet Pribadi & Crypto'}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {isSyncingData && <ActivityIndicator size="small" color="#0284c7" />}
          <Pressable
            style={[styles.iconBtn, { backgroundColor: themeCard, borderColor: themeBorder }]}
            onPress={() => router.push('/settings' as any)}
          >
            <Ionicons name="settings-outline" size={20} color={themeText} />
          </Pressable>
        </View>
      </View>

      {activeTab === 'history' ? (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={renderTransactionItem}
          ListHeaderComponent={headerSection}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={12}
          maxToRenderPerBatch={10}
          windowSize={7}
          onEndReached={loadMoreTransactions}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            !isSyncingData ? (
              <View style={[styles.emptyCard, { backgroundColor: themeCard, borderColor: themeBorder }]}>
                <Ionicons name="document-text-outline" size={32} color="#94a3b8" />
                <Text style={[styles.emptyTitle, { color: themeText }]}>Tidak Ada Transaksi</Text>
                <Text style={[styles.emptySubtext, { color: themeSubtext }]}>
                  Belum ada catatan transaksi yang cocok dengan filter ini.
                </Text>
              </View>
            ) : undefined
          }
          ListFooterComponent={
            isLoadingMore ? (
              <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#0284c7" />
                <Text style={{ fontSize: 11, color: themeSubtext, marginTop: 4 }}>
                  Memuat halaman berikutnya...
                </Text>
              </View>
            ) : !hasMoreTransactions && transactions.length > 0 ? (
              <Text style={{ textAlign: 'center', fontSize: 11, color: themeSubtext, marginTop: 8 }}>
                Semua data yang cocok telah ditampilkan
              </Text>
            ) : undefined
          }
        />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {headerSection}
          <View style={styles.cryptoHeaderRow}>
            <Text style={[styles.sectionHeading, { color: themeText }]}>Aset Kripto Anda</Text>
            <Pressable
              style={styles.refreshBtn}
              onPress={fetchLiveCrypto}
              disabled={isLoadingCrypto}
            >
              {isLoadingCrypto ? (
                <ActivityIndicator size="small" color="#0284c7" />
              ) : (
                <>
                  <Ionicons name="refresh" size={14} color="#0284c7" />
                  <Text style={styles.refreshText}>Update Harga Live</Text>
                </>
              )}
            </Pressable>
          </View>

          {cryptoAssets.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: themeCard, borderColor: themeBorder }]}>
              <Ionicons name="logo-bitcoin" size={32} color="#f59e0b" />
              <Text style={[styles.emptyTitle, { color: themeText }]}>Portofolio Masih Kosong</Text>
              <Text style={[styles.emptySubtext, { color: themeSubtext }]}>
                Catat pembelian aset crypto melalui tombol (+) untuk memantau grafik dan nilai live.
              </Text>
            </View>
          ) : (
            cryptoAssets.map((asset) => <CryptoItem key={asset.id} asset={asset} />)
          )}
        </ScrollView>
      )}

      {/* FLOATING ACTION BUTTON (+) */}
      <Pressable
        style={styles.fab}
        onPress={() => router.push('/add-transaction' as any)}
      >
        <Ionicons name="add" size={28} color="#ffffff" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
  },
  brandTitle: { fontSize: 22, fontWeight: 'bold', letterSpacing: -0.5 },
  userEmailText: { fontSize: 12, marginTop: 2, maxWidth: 230 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },

  summaryCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
    elevation: 4,
  },
  netWorthLabel: { fontSize: 12, color: '#94a3b8' },
  countBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  countBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#38bdf8' },
  netWorthValue: { fontSize: 26, fontWeight: 'bold', color: '#ffffff', marginTop: 4, marginBottom: 16 },
  walletSplitRow: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  walletBox: { flex: 1 },
  walletDivider: { width: 1, backgroundColor: '#334155', marginHorizontal: 12 },
  walletBoxLabel: { fontSize: 11, color: '#94a3b8' },
  walletBoxAmount: { fontSize: 14, fontWeight: 'bold', color: '#ffffff', marginTop: 3 },

  dailyBudgetBox: { backgroundColor: '#1e293b', borderRadius: 12, padding: 12 },
  dailyBudgetLabel: { fontSize: 11, color: '#cbd5e1' },
  dailyBudgetAmount: { fontSize: 12, fontWeight: 'bold', color: '#38bdf8' },
  progressTrack: { height: 6, backgroundColor: '#334155', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },

  tabContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabText: { fontSize: 13, fontWeight: 'bold' },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  searchInput: { flex: 1, fontSize: 13 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  filterChipText: { fontSize: 11, fontWeight: '600' },

  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  txIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txTitle: { fontSize: 14, fontWeight: 'bold' },
  txMeta: { fontSize: 11, marginTop: 3 },
  txAmount: { fontSize: 14, fontWeight: 'bold' },

  cryptoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeading: { fontSize: 15, fontWeight: 'bold' },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  refreshText: { fontSize: 11, fontWeight: 'bold', color: '#0284c7' },

  emptyCard: {
    alignItems: 'center',
    padding: 28,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 4,
  },
  emptyTitle: { fontSize: 15, fontWeight: 'bold', marginTop: 10 },
  emptySubtext: { fontSize: 12, textAlign: 'center', marginTop: 4, lineHeight: 18 },

  fab: {
    position: 'absolute',
    right: 22,
    bottom: 26,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
});