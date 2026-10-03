import { getShieldStatus } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  dailyLimit: number;
  safeSpendRemaining: number;
  onPressShield: () => void;
}

export const HeaderShield: React.FC<Props> = ({ dailyLimit, safeSpendRemaining, onPressShield }) => {
  const status = getShieldStatus(dailyLimit, safeSpendRemaining);

  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.brandTitle}>JagaKas</Text>
        <Text style={styles.brandSubtitle}>Kawal Arus Kas & Aset</Text>
      </View>
      <Pressable style={[styles.shieldBadge, { backgroundColor: status.color }]} onPress={onPressShield}>
        <Ionicons name={status.icon} size={16} color="white" />
        <Text style={styles.shieldText}>{status.label}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  brandTitle: { fontSize: 22, fontWeight: 'bold', color: '#0f172a' },
  brandSubtitle: { fontSize: 12, color: '#64748b' },
  shieldBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
  shieldText: { color: 'white', fontSize: 12, fontWeight: '600' },
});