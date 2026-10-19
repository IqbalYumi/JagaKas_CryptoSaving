import { formatRupiah } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  netWorthTotal: number;
  safeSpendRemaining: number;
  dailyLimit: number;
  onPressSettings: () => void;
}

export const SummaryCard: React.FC<Props> = ({ netWorthTotal, safeSpendRemaining, dailyLimit, onPressSettings }) => {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.cardHeaderRow}>
        <Text style={styles.summaryLabel}>Total Kekayaan (Kas + Crypto)</Text>
        <Pressable onPress={onPressSettings}>
          <Ionicons name="settings-outline" size={18} color="#94a3b8" />
        </Pressable>
      </View>
      <Text style={styles.netWorthValue}>{formatRupiah(netWorthTotal)}</Text>

      <View style={styles.cardDivider} />

      <View style={styles.safeSpendRow}>
        <View>
          <Text style={styles.safeSpendLabel}>Batas Aman Belanja Hari Ini</Text>
          <Text style={[styles.safeSpendValue, { color: safeSpendRemaining < 0 ? '#ef4444' : '#38bdf8' }]}>
            {formatRupiah(safeSpendRemaining)}
          </Text>
        </View>
        <Text style={styles.safeSpendSubtext}>Kuota: {formatRupiah(dailyLimit)}/hr</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: '#0f172a',
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
    padding: 20,
    borderRadius: 20,
    // Accent Border
    borderWidth: 1,
    borderColor: '#1e293b',
    elevation: 4,
  },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { color: '#94a3b8', fontSize: 12, fontWeight: '500' },
  netWorthValue: { color: '#ffffff', fontSize: 28, fontWeight: 'bold', marginTop: 6, letterSpacing: -0.5 },
  cardDivider: { height: 1, backgroundColor: '#1e293b', marginVertical: 16 },
  safeSpendRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  safeSpendLabel: { color: '#cbd5e1', fontSize: 12 },
  safeSpendValue: { fontSize: 20, fontWeight: 'bold', marginTop: 2 },
  safeSpendSubtext: { color: '#64748b', fontSize: 11, fontWeight: '500' },
});