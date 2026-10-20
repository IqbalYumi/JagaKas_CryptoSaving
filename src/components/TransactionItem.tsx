import { Transaction } from '@/types';
import { formatRupiah } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const getCategoryMeta = (type: string, title?: string) => {
  const lowerTitle = (title || '').toLowerCase();
  if (type === 'inflow') {
    return { icon: 'cash-outline' as const, bg: '#dcfce7', color: '#16a34a', label: 'Pemasukan' };
  }
  if (lowerTitle.includes('makan') || lowerTitle.includes('kopi') || lowerTitle.includes('minum') || lowerTitle.includes('kuliner')) {
    return { icon: 'fast-food-outline' as const, bg: '#ffedd5', color: '#ea580c', label: 'Kuliner' };
  }
  if (lowerTitle.includes('bensin') || lowerTitle.includes('trans') || lowerTitle.includes('gojek') || lowerTitle.includes('transport')) {
    return { icon: 'car-outline' as const, bg: '#e0e7ff', color: '#4f46e5', label: 'Transport' };
  }
  return { icon: 'cart-outline' as const, bg: '#fee2e2', color: '#dc2626', label: 'Pengeluaran' };
};

export const TransactionItem: React.FC<{ item: Transaction }> = ({ item }) => {
  const meta = getCategoryMeta(item.type, item.title);

  return (
    <View style={styles.itemCard}>
      <View style={[styles.iconCircle, { backgroundColor: meta.bg }]}>
        <Ionicons name={meta.icon} size={20} color={meta.color} />
      </View>
      <View style={styles.itemDetails}>
        <Text style={styles.itemTitle}>{item.title || 'Transaksi'}</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.categoryBadge, { backgroundColor: meta.bg }]}>
            <Text style={[styles.categoryText, { color: meta.color }]}>{meta.label}</Text>
          </View>
          <Text style={styles.itemSubtext}>• {item.date}</Text>
        </View>
      </View>
      <Text style={[styles.itemAmount, { color: item.type === 'inflow' ? '#16a34a' : '#dc2626' }]}>
        {item.type === 'inflow' ? '+' : '-'} {formatRupiah(item.amount || 0)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  iconCircle: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  itemDetails: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  categoryText: { fontSize: 10, fontWeight: '600' },
  itemSubtext: { fontSize: 11, color: '#94a3b8' },
  itemAmount: { fontSize: 14, fontWeight: 'bold' },
});