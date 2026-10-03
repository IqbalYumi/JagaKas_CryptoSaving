import { Transaction } from '@/types';
import { formatRupiah } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const TransactionItem: React.FC<{ item: Transaction }> = ({ item }) => (
  <View style={styles.itemCard}>
    <View style={[styles.iconCircle, { backgroundColor: item.type === 'inflow' ? '#dcfce7' : '#fee2e2' }]}>
      <Ionicons
        name={item.type === 'inflow' ? 'arrow-down-outline' : 'arrow-up-outline'}
        size={20}
        color={item.type === 'inflow' ? '#16a34a' : '#dc2626'}
      />
    </View>
    <View style={styles.itemDetails}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemSubtext}>{item.category} • {item.date}</Text>
    </View>
    <Text style={[styles.itemAmount, { color: item.type === 'inflow' ? '#16a34a' : '#0f172a' }]}>
      {item.type === 'inflow' ? '+' : '-'} {formatRupiah(item.amount)}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#f1f5f9' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  itemDetails: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  itemSubtext: { fontSize: 12, color: '#64748b', marginTop: 2 },
  itemAmount: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
});