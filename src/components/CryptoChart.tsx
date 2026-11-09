import { CryptoHistoryData, fetchCryptoHistoryAsync } from '@/services/apiService';
import { formatRupiah } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

interface CryptoChartProps {
  coinId: string;
  symbol: string;
  name: string;
}

export const CryptoChart: React.FC<CryptoChartProps> = ({ coinId, symbol, name }) => {
  const [historyData, setHistoryData] = useState<CryptoHistoryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [days, setDays] = useState<number>(7);

  const loadChartData = async () => {
    try {
      setLoading(true);
      setError(false);
      const data = await fetchCryptoHistoryAsync(coinId, days);
      setHistoryData(data);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChartData();
  }, [coinId, days]);

  const isPositive = (historyData?.changePercentage || 0) >= 0;
  const lineColor = isPositive ? '#22c55e' : '#ef4444';

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <View>
          <Text style={styles.chartTitle}>{name} ({symbol})</Text>
          <Text style={styles.chartSubtitle}>Tren Harga {days} Hari Terakhir</Text>
        </View>

        {historyData && (
          <View style={[styles.badge, { backgroundColor: isPositive ? '#dcfce7' : '#fee2e2' }]}>
            <Ionicons
              name={isPositive ? 'trending-up' : 'trending-down'}
              size={14}
              color={isPositive ? '#15803d' : '#b91c1c'}
            />
            <Text style={[styles.badgeText, { color: isPositive ? '#15803d' : '#b91c1c' }]}>
              {historyData.changePercentage.toFixed(2)}%
            </Text>
          </View>
        )}
      </View>

      <View style={styles.timeframeRow}>
        {[1, 7, 30].map((d) => (
          <Pressable
            key={d}
            style={[styles.timeChip, days === d && styles.timeChipActive]}
            onPress={() => setDays(d)}
          >
            <Text style={[styles.timeChipText, days === d && styles.timeChipTextActive]}>
              {d === 1 ? '24 Jam' : `${d} Hari`}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color="#0f172a" />
          <Text style={styles.loadingText}>Memuat data grafik dari API...</Text>
        </View>
      ) : error || !historyData ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={28} color="#ef4444" />
          <Text style={styles.errorText}>Gagal memuat grafik. Coba lagi.</Text>
          <Pressable style={styles.retryButton} onPress={loadChartData}>
            <Text style={styles.retryText}>Muat Ulang</Text>
          </Pressable>
        </View>
      ) : (
        <View>
          <View style={styles.barsContainer}>
            {historyData.prices.slice(-20).map((point, idx) => {
              const range = historyData.maxPrice - historyData.minPrice || 1;
              const heightPercent = Math.max(15, Math.min(100, ((point.price - historyData.minPrice) / range) * 100));
              return (
                <View key={idx} style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      { height: `${heightPercent}%`, backgroundColor: lineColor },
                    ]}
                  />
                </View>
              );
            })}
          </View>

          <View style={styles.statsRow}>
            <View>
              <Text style={styles.statLabel}>Terendah ({days}H)</Text>
              <Text style={styles.statValue}>{formatRupiah(historyData.minPrice)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.statLabel}>Tertinggi ({days}H)</Text>
              <Text style={styles.statValue}>{formatRupiah(historyData.maxPrice)}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default CryptoChart;

const styles = StyleSheet.create({
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    elevation: 2,
  },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  chartTitle: { fontSize: 15, fontWeight: 'bold', color: '#0f172a' },
  chartSubtitle: { fontSize: 11, color: '#64748b', marginTop: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: 'bold' },

  timeframeRow: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  timeChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: '#f1f5f9' },
  timeChipActive: { backgroundColor: '#0f172a' },
  timeChipText: { fontSize: 11, fontWeight: '600', color: '#64748b' },
  timeChipTextActive: { color: '#ffffff' },

  centerContainer: { height: 100, justifyContent: 'center', alignItems: 'center', gap: 6 },
  loadingText: { fontSize: 11, color: '#64748b' },
  errorText: { fontSize: 12, color: '#ef4444' },
  retryButton: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#f8fafc', borderRadius: 8 },
  retryText: { fontSize: 11, fontWeight: 'bold', color: '#0f172a' },

  barsContainer: { flexDirection: 'row', alignItems: 'flex-end', height: 70, gap: 4, marginVertical: 8, paddingHorizontal: 4 },
  barWrapper: { flex: 1, height: '100%', justifyContent: 'flex-end', alignItems: 'center' },
  bar: { width: '80%', borderRadius: 4 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  statLabel: { fontSize: 10, color: '#94a3b8' },
  statValue: { fontSize: 12, fontWeight: 'bold', color: '#334155', marginTop: 2 },
});