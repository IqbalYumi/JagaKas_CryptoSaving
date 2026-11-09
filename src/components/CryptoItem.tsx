import { CryptoAsset } from '@/types';
import { formatRupiah } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CryptoChart } from './CryptoChart';

export const CryptoItem: React.FC<{ asset: CryptoAsset }> = ({ asset }) => {
  const [showChart, setShowChart] = useState<boolean>(false);

  const totalValue = asset.amount * asset.priceIdr;
  const coinId = asset.name.toLowerCase();

  return (
    <View style={styles.container}>
      <Pressable style={styles.itemCard} onPress={() => setShowChart((prev) => !prev)}>
        <View style={styles.iconCircle}>
          <Ionicons name="logo-bitcoin" size={22} color="#f59e0b" />
        </View>

        <View style={styles.itemDetails}>
          <Text style={styles.itemTitle}>{asset.name}</Text>
          <Text style={styles.itemSubtext}>
            {asset.amount} {asset.symbol} • {formatRupiah(asset.priceIdr)}/coin
          </Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.totalValueText}>{formatRupiah(totalValue)}</Text>
          <View style={styles.chartToggleBadge}>
            <Text style={styles.chartToggleText}>{showChart ? 'Sembunyikan' : 'Lihat Grafik'}</Text>
            <Ionicons name={showChart ? 'chevron-up' : 'chevron-down'} size={12} color="#0284c7" />
          </View>
        </View>
      </Pressable>

      {/* EXPANDABLE GRAFIK API */}
      {showChart && (
        <View style={styles.chartWrapper}>
          <CryptoChart coinId={coinId} symbol={asset.symbol} name={asset.name} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 10 },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    elevation: 2,
  },
  iconCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#fffbebfb', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  itemDetails: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
  itemSubtext: { fontSize: 11, color: '#64748b', marginTop: 2 },
  totalValueText: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
  chartToggleBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 },
  chartToggleText: { fontSize: 10, fontWeight: 'bold', color: '#0284c7' },
  chartWrapper: { marginTop: 8 },
});