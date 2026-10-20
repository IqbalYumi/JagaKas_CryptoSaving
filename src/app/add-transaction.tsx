import { useFinance } from '@/context/FinanceContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
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

export default function AddTransactionScreen() {
  const router = useRouter();
  const { addTransaction } = useFinance();

  const [type, setType] = useState<'inflow' | 'outflow'>('outflow');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Kuliner');

  // Navigasi Kembali secara Aman
  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/' as any);
    }
  };

  // Preset Nominal Cepat
  const handleQuickAddAmount = (addValue: number) => {
    const cleanCurrent = parseInt(amount.replace(/[^0-9]/g, ''), 10) || 0;
    setAmount((cleanCurrent + addValue).toString());
  };

  // Simpan Transaksi & Sanitasi Input
  const handleSave = () => {
    const cleanAmountStr = amount.replace(/[^0-9]/g, '');
    const numericAmount = parseInt(cleanAmountStr, 10);

    if (!title.trim()) {
      Alert.alert('Perhatian', 'Harap isi keterangan transaksi.');
      return;
    }

    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Perhatian', 'Masukkan nominal angka yang valid.');
      return;
    }

    // Panggil fungsi global addTransaction dari Context
    addTransaction({
      title: title.trim(),
      amount: numericAmount,
      type,
      category,
    });

    handleGoBack();
  };

  const categories = type === 'outflow' ? OUTFLOW_CATEGORIES : INFLOW_CATEGORIES;

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER UTAMA DENGAN TOMBOL KEMBALI */}
      <View style={styles.header}>
        <Pressable onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#0f172a" />
        </Pressable>
        <Text style={styles.headerTitle}>
          {type === 'outflow' ? 'Tambah Pengeluaran' : 'Tambah Pemasukan'}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
        {/* TOGGLE TIPE TRANSAKSI (PEMASUKAN / PENGELUARAN) */}
        <View style={styles.typeSelectorContainer}>
          <Pressable
            style={[styles.typeSegment, type === 'outflow' && styles.typeSegmentOutflow]}
            onPress={() => {
              setType('outflow');
              setCategory('Kuliner');
            }}
          >
            <Ionicons name="arrow-up-circle-outline" size={18} color={type === 'outflow' ? '#dc2626' : '#64748b'} />
            <Text style={[styles.typeSegmentText, type === 'outflow' && styles.typeTextOutflow]}>Pengeluaran (-)</Text>
          </Pressable>

          <Pressable
            style={[styles.typeSegment, type === 'inflow' && styles.typeSegmentInflow]}
            onPress={() => {
              setType('inflow');
              setCategory('Gaji');
            }}
          >
            <Ionicons name="arrow-down-circle-outline" size={18} color={type === 'inflow' ? '#16a34a' : '#64748b'} />
            <Text style={[styles.typeSegmentText, type === 'inflow' && styles.typeTextInflow]}>Pemasukan (+)</Text>
          </Pressable>
        </View>

        {/* INPUT NOMINAL UTAMA */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nominal Transaksi (Rp)</Text>
          <View style={styles.amountInputRow}>
            <Text style={styles.currencyPrefix}>Rp</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
        </View>

        {/* PRESET NOMINAL CEPAT */}
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

        {/* PILIHAN KATEGORI TRANSAKSI */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kategori</Text>
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

        {/* INPUT KETERANGAN */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Keterangan / Catatan</Text>
          <View style={styles.textInputWrapper}>
            <Ionicons name="create-outline" size={20} color="#94a3b8" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.textInput}
              placeholder="Contoh: Nasi Goreng & Es Teh"
              placeholderTextColor="#94a3b8"
              value={title}
              onChangeText={setTitle}
            />
          </View>
        </View>

        {/* TOMBOL BATAL DAN SIMPAN */}
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
    borderBottomColor: '#f1f5f9',
  },
  backButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  formContent: { padding: 20 },

  typeSelectorContainer: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 14, padding: 4, marginBottom: 20 },
  typeSegment: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, gap: 6 },
  typeSegmentOutflow: { backgroundColor: '#ffffff', elevation: 1 },
  typeSegmentInflow: { backgroundColor: '#ffffff', elevation: 1 },
  typeSegmentText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  typeTextOutflow: { color: '#dc2626' },
  typeTextInflow: { color: '#16a34a' },

  inputGroup: { marginBottom: 18 },
  label: { fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 8 },
  amountInputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10 },
  currencyPrefix: { fontSize: 22, fontWeight: 'bold', color: '#0f172a', marginRight: 8 },
  amountInput: { flex: 1, fontSize: 24, fontWeight: 'bold', color: '#0f172a' },

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