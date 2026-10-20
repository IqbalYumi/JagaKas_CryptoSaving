import { CryptoItem } from '@/components/CryptoItem';
import { HeaderShield } from '@/components/HeaderShield';
import { SummaryCard } from '@/components/SummaryCard';
import { TransactionItem } from '@/components/TransactionItem';
import { useFinance } from '@/context/FinanceContext';
import { formatRupiah } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const router = useRouter();

  // AMBIL STATE GLOBAL DARI CONTEXT (JANGAN GUNAKAN useState LOKAL UNTUK INI)
  const { cashBalance, dailyLimit, transactions, cryptoAssets } = useFinance();

  // State lokal HANYA untuk filter & tab UI
  const [activeTab, setActiveTab] = useState<'cash' | 'crypto'>('cash');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'inflow' | 'outflow'>('all');

  // Hitung Total Arus Kas secara otomatis dari transaksi Context
  const totalInflow = transactions
    .filter((t) => t.type === 'inflow')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalOutflow = transactions
    .filter((t) => t.type === 'outflow')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const safeSpendRemaining = dailyLimit - totalOutflow;
  const totalCryptoIdr = cryptoAssets.reduce((sum, a) => sum + a.amount * a.priceIdr, 0);
  const netWorthTotal = cashBalance + totalCryptoIdr;

  // Filter Transaksi untuk Tampilan
  const filteredTransactions = transactions.filter((t) => {
    if (historyFilter === 'inflow') return t.type === 'inflow';
    if (historyFilter === 'outflow') return t.type === 'outflow';
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      <HeaderShield
        dailyLimit={dailyLimit}
        safeSpendRemaining={safeSpendRemaining}
        onPressShield={() => router.push('/add-transaction' as any)}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* KARTU RINGKASAN NET WORTH */}
        <SummaryCard
          netWorthTotal={netWorthTotal}
          safeSpendRemaining={safeSpendRemaining}
          dailyLimit={dailyLimit}
          onPressSettings={() => router.push('/add-transaction' as any)}
        />

        {/* KARTU PEMASUKAN & PENGELUARAN */}
        <View style={styles.flowCardsContainer}>
          <View style={[styles.flowCard, styles.inflowCard]}>
            <View style={styles.flowIconBadgeIn}>
              <Ionicons name="arrow-down-circle" size={20} color="#16a34a" />
            </View>
            <View>
              <Text style={styles.flowLabel}>Pemasukan</Text>
              <Text style={styles.flowValueIn}>{formatRupiah(totalInflow)}</Text>
            </View>
          </View>

          <View style={[styles.flowCard, styles.outflowCard]}>
            <View style={styles.flowIconBadgeOut}>
              <Ionicons name="arrow-up-circle" size={20} color="#dc2626" />
            </View>
            <View>
              <Text style={styles.flowLabel}>Pengeluaran</Text>
              <Text style={styles.flowValueOut}>{formatRupiah(totalOutflow)}</Text>
            </View>
          </View>
        </View>

        {/* TAB NAVIGATION */}
        <View style={styles.tabContainer}>
          <Pressable
            style={[styles.tabButton, activeTab === 'cash' && styles.tabButtonActive]}
            onPress={() => setActiveTab('cash')}
          >
            <Ionicons name="receipt-outline" size={16} color={activeTab === 'cash' ? '#0f172a' : '#64748b'} />
            <Text style={[styles.tabText, activeTab === 'cash' && styles.tabTextActive]}>Riwayat Transaksi</Text>
          </Pressable>
          <Pressable
            style={[styles.tabButton, activeTab === 'crypto' && styles.tabButtonActive]}
            onPress={() => setActiveTab('crypto')}
          >
            <Ionicons name="logo-bitcoin" size={16} color={activeTab === 'crypto' ? '#0f172a' : '#64748b'} />
            <Text style={[styles.tabText, activeTab === 'crypto' && styles.tabTextActive]}>Portofolio Crypto</Text>
          </Pressable>
        </View>

        {/* KONTEN ARUS KAS */}
        {activeTab === 'cash' ? (
          <View>
            {/* FILTER CHIPS */}
            <View style={styles.filterChipContainer}>
              <Pressable
                style={[styles.chip, historyFilter === 'all' && styles.chipActive]}
                onPress={() => setHistoryFilter('all')}
              >
                <Text style={[styles.chipText, historyFilter === 'all' && styles.chipTextActive]}>Semua</Text>
              </Pressable>
              <Pressable
                style={[styles.chip, historyFilter === 'inflow' && styles.chipActiveInflow]}
                onPress={() => setHistoryFilter('inflow')}
              >
                <Text style={[styles.chipText, historyFilter === 'inflow' && styles.chipTextInflow]}>Masuk</Text>
              </Pressable>
              <Pressable
                style={[styles.chip, historyFilter === 'outflow' && styles.chipActiveOutflow]}
                onPress={() => setHistoryFilter('outflow')}
              >
                <Text style={[styles.chipText, historyFilter === 'outflow' && styles.chipTextOutflow]}>Keluar</Text>
              </Pressable>
            </View>

            {/* LIST RIWAYAT TRANSAKSI */}
            {filteredTransactions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={44} color="#cbd5e1" />
                <Text style={styles.emptyTitle}>Belum Ada Catatan</Text>
                <Text style={styles.emptySubtext}>Tekan tombol (+) di bawah untuk menambah transaksi baru.</Text>
              </View>
            ) : (
              filteredTransactions.map((item) => <TransactionItem key={item.id} item={item} />)
            )}
          </View>
        ) : (
          <View>
            {cryptoAssets.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="logo-bitcoin" size={44} color="#cbd5e1" />
                <Text style={styles.emptyTitle}>Belum Ada Aset Crypto</Text>
                <Text style={styles.emptySubtext}>Daftarkan aset crypto Anda.</Text>
              </View>
            ) : (
              cryptoAssets.map((asset) => <CryptoItem key={asset.id} asset={asset} />)
            )}
          </View>
        )}
      </ScrollView>

      {/* FAB BUTTON */}
      <Pressable style={styles.fabButton} onPress={() => router.push('/add-transaction' as any)}>
        <Ionicons name="add" size={28} color="white" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },

  flowCardsContainer: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  flowCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 10,
    elevation: 2,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  inflowCard: { borderLeftWidth: 4, borderLeftColor: '#22c55e' },
  outflowCard: { borderLeftWidth: 4, borderLeftColor: '#ef4444' },
  flowIconBadgeIn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#dcfce7', justifyContent: 'center', alignItems: 'center' },
  flowIconBadgeOut: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fee2e2', justifyContent: 'center', alignItems: 'center' },
  flowLabel: { fontSize: 11, color: '#64748b', fontWeight: '500' },
  flowValueIn: { fontSize: 13, fontWeight: 'bold', color: '#15803d', marginTop: 2 },
  flowValueOut: { fontSize: 13, fontWeight: 'bold', color: '#b91c1c', marginTop: 2 },

  tabContainer: { flexDirection: 'row', marginBottom: 14, backgroundColor: '#e2e8f0', borderRadius: 12, padding: 4 },
  tabButton: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 10, borderRadius: 10, gap: 6 },
  tabButtonActive: { backgroundColor: '#ffffff' },
  tabText: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  tabTextActive: { color: '#0f172a', fontWeight: 'bold' },

  filterChipContainer: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  chip: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0' },
  chipActive: { backgroundColor: '#0f172a', borderColor: '#0f172a' },
  chipActiveInflow: { backgroundColor: '#dcfce7', borderColor: '#22c55e' },
  chipActiveOutflow: { backgroundColor: '#fee2e2', borderColor: '#ef4444' },
  chipText: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  chipTextActive: { color: '#ffffff' },
  chipTextInflow: { color: '#15803d' },
  chipTextOutflow: { color: '#b91c1c' },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 36, backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', marginTop: 4 },
  emptyTitle: { fontSize: 15, fontWeight: 'bold', color: '#334155', marginTop: 10 },
  emptySubtext: { fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 4, paddingHorizontal: 28 },

  fabButton: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', elevation: 6 },
});