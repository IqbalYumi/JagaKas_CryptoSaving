import { useFinance } from '@/context/FinanceContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const router = useRouter();
  const { 
    cashBalance, 
    dailyLimit, 
    isDarkMode, 
    notificationsEnabled, 
    toggleDarkMode, 
    toggleNotifications, 
    updateSettings, 
    resetData 
  } = useFinance();

  const [balanceInput, setBalanceInput] = useState(cashBalance.toString());
  const [limitInput, setLimitInput] = useState(dailyLimit.toString());

  const themeContainerStyle = isDarkMode ? styles.darkContainer : styles.lightContainer;
  const themeCardStyle = isDarkMode ? styles.darkCard : styles.lightCard;
  const themeTextColor = isDarkMode ? '#f8fafc' : '#0f172a';
  const themeSubtextColor = isDarkMode ? '#94a3b8' : '#64748b';

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/' as any);
    }
  };

  const handleSaveBudget = () => {
    const cleanBalance = parseInt(balanceInput.replace(/[^0-9]/g, ''), 10);
    const cleanLimit = parseInt(limitInput.replace(/[^0-9]/g, ''), 10);

    if (isNaN(cleanBalance) || cleanBalance < 0) {
      Alert.alert('Perhatian', 'Masukkan nominal saldo kas yang valid.');
      return;
    }

    if (isNaN(cleanLimit) || cleanLimit <= 0) {
      Alert.alert('Perhatian', 'Masukkan batas belanja harian yang valid.');
      return;
    }

    updateSettings(cleanBalance, cleanLimit);
    Alert.alert('Berhasil', 'Pengaturan anggaran berhasil disimpan.');
  };

  const handleResetConfirm = () => {
    Alert.alert(
      'Reset Data Transaksi',
      'Apakah Anda yakin ingin menghapus seluruh catatan transaksi? Tindakan ini tidak dapat dibatalkan.',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Hapus Semua', 
          style: 'destructive', 
          onPress: () => {
            resetData();
            Alert.alert('Selesai', 'Seluruh data transaksi berhasil direset.');
          } 
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, themeContainerStyle]}>
      {/* HEADER */}
      <View style={[styles.header, { borderBottomColor: isDarkMode ? '#334155' : '#f1f5f9' }]}>
        <Pressable onPress={handleGoBack} style={[styles.backButton, { backgroundColor: isDarkMode ? '#334155' : '#f8fafc' }]}>
          <Ionicons name="arrow-back" size={22} color={themeTextColor} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: themeTextColor }]}>Pengaturan</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* SEKSI 1: TAMPILAN & TEMA */}
        <Text style={[styles.sectionTitle, { color: themeSubtextColor }]}>TAMPILAN & PREFERENSI</Text>
        
        <View style={[styles.settingCard, themeCardStyle]}>
          <View style={styles.rowItem}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBadge, { backgroundColor: '#e0e7ff' }]}>
                <Ionicons name={isDarkMode ? 'moon' : 'sunny'} size={20} color="#4f46e5" />
              </View>
              <View>
                <Text style={[styles.rowTitle, { color: themeTextColor }]}>Mode Gelap (Dark Mode)</Text>
                <Text style={[styles.rowSubtext, { color: themeSubtextColor }]}>Ubah tema aplikasi ke serba gelap</Text>
              </View>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#cbd5e1', true: '#6366f1' }}
              thumbColor={isDarkMode ? '#ffffff' : '#f8fafc'}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: isDarkMode ? '#334155' : '#f1f5f9' }]} />

          <View style={styles.rowItem}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBadge, { backgroundColor: '#dcfce7' }]}>
                <Ionicons name="notifications-outline" size={20} color="#16a34a" />
              </View>
              <View>
                <Text style={[styles.rowTitle, { color: themeTextColor }]}>Pengingat Catat Kas</Text>
                <Text style={[styles.rowSubtext, { color: themeSubtextColor }]}>Notifikasi pengingat transaksi harian</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: '#cbd5e1', true: '#22c55e' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* SEKSI 2: BATAS ANGGARAN & SALDO */}
        <Text style={[styles.sectionTitle, { color: themeSubtextColor }]}>ANGGARAN & SALDO</Text>

        <View style={[styles.settingCard, themeCardStyle]}>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: themeTextColor }]}>Batas Belanja Harian (Daily Limit)</Text>
            <View style={[styles.amountInputRow, { backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', borderColor: isDarkMode ? '#475569' : '#cbd5e1' }]}>
              <Text style={[styles.currencyPrefix, { color: themeTextColor }]}>Rp</Text>
              <TextInput
                style={[styles.amountInput, { color: themeTextColor }]}
                keyboardType="numeric"
                value={limitInput}
                onChangeText={setLimitInput}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: themeTextColor }]}>Penyesuaian Saldo Kas</Text>
            <View style={[styles.amountInputRow, { backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', borderColor: isDarkMode ? '#475569' : '#cbd5e1' }]}>
              <Text style={[styles.currencyPrefix, { color: themeTextColor }]}>Rp</Text>
              <TextInput
                style={[styles.amountInput, { color: themeTextColor }]}
                keyboardType="numeric"
                value={balanceInput}
                onChangeText={setBalanceInput}
              />
            </View>
          </View>

          <Pressable style={styles.saveBudgetButton} onPress={handleSaveBudget}>
            <Ionicons name="save-outline" size={18} color="white" style={{ marginRight: 6 }} />
            <Text style={styles.saveBudgetButtonText}>Simpan Anggaran</Text>
          </Pressable>
        </View>

        {/* SEKSI 3: MANAJEMEN DATA & APLIKASI */}
        <Text style={[styles.sectionTitle, { color: themeSubtextColor }]}>SISTEM & AKUN</Text>

        <View style={[styles.settingCard, themeCardStyle]}>
          <Pressable style={styles.dangerRow} onPress={handleResetConfirm}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBadge, { backgroundColor: '#fee2e2' }]}>
                <Ionicons name="trash-outline" size={20} color="#dc2626" />
              </View>
              <View>
                <Text style={styles.dangerTitle}>Reset Seluruh Transaksi</Text>
                <Text style={[styles.rowSubtext, { color: themeSubtextColor }]}>Kosongkan riwayat kas & saldo</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#dc2626" />
          </Pressable>
        </View>

        <Text style={[styles.versionText, { color: themeSubtextColor }]}>JagaKas App v1.0.0 • React Native Expo Router</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  lightContainer: { backgroundColor: '#f8fafc' },
  darkContainer: { backgroundColor: '#0f172a' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backButton: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: 'bold' },
  content: { padding: 20 },

  sectionTitle: { fontSize: 11, fontWeight: 'bold', letterSpacing: 0.8, marginBottom: 8, marginLeft: 4 },
  settingCard: { borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1 },
  lightCard: { backgroundColor: '#ffffff', borderColor: '#f1f5f9' },
  darkCard: { backgroundColor: '#1e293b', borderColor: '#334155' },

  rowItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconBadge: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  rowTitle: { fontSize: 14, fontWeight: '600' },
  rowSubtext: { fontSize: 12, marginTop: 2 },
  divider: { height: 1, marginVertical: 14 },

  inputGroup: { marginBottom: 14 },
  inputLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  amountInputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  currencyPrefix: { fontSize: 16, fontWeight: 'bold', marginRight: 6 },
  amountInput: { flex: 1, fontSize: 16, fontWeight: 'bold' },

  saveBudgetButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a', paddingVertical: 12, borderRadius: 10, marginTop: 4 },
  saveBudgetButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },

  dangerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dangerTitle: { fontSize: 14, fontWeight: 'bold', color: '#dc2626' },

  versionText: { textAlign: 'center', fontSize: 11, marginTop: 10, marginBottom: 20 },
});