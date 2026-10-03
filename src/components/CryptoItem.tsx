import { CryptoAsset } from '@/types';
import { formatRupiah } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const CryptoItem: React.FC<{ asset: CryptoAsset }> = ({ asset }) => {
  const assetTotalIdr = asset.amount * asset.priceIdr;
  return (
    <View style={styles.itemCard}>
      <View style={[styles.iconCircle, { backgroundColor: '#f1f5f9' }]}>
        <Ionicons name="analytics-outline" size={20} color="#0284c7" />
      </View>
      <View style={styles.itemDetails}>
        <Text style={styles.itemTitle}>{asset.name} ({asset.symbol})</Text>
        <Text style={styles.itemSubtext}>Jumlah: {asset.amount} {asset.symbol}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.itemAmount}>{formatRupiah(assetTotalIdr)}</Text>
        <Text style={styles.itemSubtext}>@ {formatRupiah(asset.priceIdr)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#f1f5f9' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  itemDetails: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  itemSubtext: { fontSize: 12, color: '#64748b', marginTop: 2 },
  itemAmount: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
});