import { CryptoItem } from '@/components/CryptoItem';
import { HeaderShield } from '@/components/HeaderShield';
import { AppModals } from '@/components/Modals';
import { SummaryCard } from '@/components/SummaryCard';
import { TransactionItem } from '@/components/TransactionItem';
import { CryptoAsset, ModalType, Transaction } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';

export default function DashboardScreen() {
  const [activeTab, setActiveTab] = useState<'cash' | 'crypto'>('cash');
  const [cashBalance, setCashBalance] = useState<number>(0);
  const [dailyLimit, setDailyLimit] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cryptoAssets, setCryptoAssets] = useState<CryptoAsset[]>([]);
  const [activeModal, setActiveModal] = useState<ModalType>('none');

  // Logika Keuangan
  const todaySpent = transactions
    .filter((t) => t.type === 'outflow')
    .reduce((sum, t) => sum + t.amount, 0);

  const safeSpendRemaining = dailyLimit - todaySpent;
  const totalCryptoIdr = cryptoAssets.reduce((sum, a) => sum + a.amount * a.priceIdr, 0);
  const netWorthTotal = cashBalance + totalCryptoIdr;

  // Handlers
  const handleSaveSetup = (balance: number, limit: number) => {
    setCashBalance(balance);
    setDailyLimit(limit);
  };

  const handleAddTransaction = (newTrans: Transaction) => {
    setTransactions([newTrans, ...transactions]);
    if (newTrans.type === 'inflow') setCashBalance((prev) => prev + newTrans.amount);
    else setCashBalance((prev) => prev - newTrans.amount);
  };

  const handleAddCrypto = (newCrypto: CryptoAsset) => {
    setCryptoAssets([newCrypto, ...cryptoAssets]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* HEADER & CARD */}
      <HeaderShield dailyLimit={dailyLimit} safeSpendRemaining={safeSpendRemaining} onPressShield={() => setActiveModal('setup')} />
      <SummaryCard netWorthTotal={netWorthTotal} safeSpendRemaining={safeSpendRemaining} dailyLimit={dailyLimit} onPressSettings={() => setActiveModal('setup')} />

      {/* TABS */}
      <View style={styles.tabContainer}>
        <Pressable style={[styles.tabButton, activeTab === 'cash' && styles.tabButtonActive]} onPress={() => setActiveTab('cash')}>
          <Ionicons name="wallet-outline" size={18} color={activeTab === 'cash' ? '#0f172a' : '#64748b'} />
          <Text style={[styles.tabText, activeTab === 'cash' && styles.tabTextActive]}>Arus Kas Harian</Text>
        </Pressable>
        <Pressable style={[styles.tabButton, activeTab === 'crypto' && styles.tabButtonActive]} onPress={() => setActiveTab('crypto')}>
          <Ionicons name="logo-bitcoin" size={18} color={activeTab === 'crypto' ? '#0f172a' : '#64748b'} />
          <Text style={[styles.tabText, activeTab === 'crypto' && styles.tabTextActive]}>Aset Crypto</Text>
        </Pressable>
      </View>

      {/* KONTEN TAB */}
      {activeTab === 'cash' ? (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => <TransactionItem item={item} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>Belum Ada Transaksi</Text>
              <Text style={styles.emptySubtext}>Tekan tombol (+) di bawah untuk mencatat transaksi baru.</Text>
            </View>
          }
        />
      ) : (
        <ScrollView contentContainerStyle={styles.listContainer}>
          {cryptoAssets.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="logo-bitcoin" size={48} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>Belum Ada Aset Crypto</Text>
              <Text style={styles.emptySubtext}>Tekan tombol (+) di bawah untuk mendaftarkan aset crypto Anda.</Text>
            </View>
          ) : (
            cryptoAssets.map((asset) => <CryptoItem key={asset.id} asset={asset} />)
          )}
        </ScrollView>
      )}

      {/* FAB BUTTON */}
      <Pressable style={styles.fabButton} onPress={() => setActiveModal(activeTab === 'cash' ? 'transaction' : 'crypto')}>
        <Ionicons name="add" size={28} color="white" />
      </Pressable>

      {/* MODALS */}
      <AppModals
        activeModal={activeModal}
        onClose={() => setActiveModal('none')}
        onSaveSetup={handleSaveSetup}
        onAddTransaction={handleAddTransaction}
        onAddCrypto={handleAddCrypto}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  tabContainer: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 12, backgroundColor: '#e2e8f0', borderRadius: 10, padding: 4 },
  tabButton: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 8, gap: 6 },
  tabButtonActive: { backgroundColor: '#ffffff' },
  tabText: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  tabTextActive: { color: '#0f172a', fontWeight: 'bold' },
  listContainer: { paddingHorizontal: 20, paddingBottom: 80 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#475569', marginTop: 12 },
  emptySubtext: { fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 4, paddingHorizontal: 32 },
  fabButton: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', elevation: 5 },
});