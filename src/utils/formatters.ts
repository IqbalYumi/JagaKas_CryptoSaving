export const formatRupiah = (val: number): string => {
  return 'Rp ' + val.toLocaleString('id-ID');
};

export const getShieldStatus = (dailyLimit: number, safeSpendRemaining: number) => {
  if (dailyLimit === 0) {
    return { label: 'Belum Diatur', color: '#64748b', icon: 'help-circle-outline' as const };
  }
  if (safeSpendRemaining > dailyLimit * 0.3) {
    return { label: 'Kas Aman', color: '#16a34a', icon: 'shield-checkmark' as const };
  } else if (safeSpendRemaining >= 0) {
    return { label: 'Kas Waspada', color: '#d97706', icon: 'shield' as const };
  } else {
    return { label: 'Kas Kritis', color: '#dc2626', icon: 'warning' as const };
  }
};