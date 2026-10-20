import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function SetupScreen() {
  const router = useRouter();
  const [balance, setBalance] = useState('');
  const [limit, setLimit] = useState('');

  const handleSave = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Pengaturan Kas Awal</Text>

        <Text style={styles.label}>Saldo Kas Rupiah Awal</Text>
        <TextInput
          style={styles.input}
          placeholder="Contoh: 2000000"
          keyboardType="numeric"
          value={balance}
          onChangeText={setBalance}
        />

        <Text style={styles.label}>Batas Belanja Per Hari</Text>
        <TextInput
          style={styles.input}
          placeholder="Contoh: 150000"
          keyboardType="numeric"
          value={limit}
          onChangeText={setLimit}
        />

        <View style={styles.actions}>
          <Pressable style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelText}>Batal</Text>
          </Pressable>
          <Pressable style={styles.submitButton} onPress={handleSave}>
            <Text style={styles.submitText}>Simpan</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  content: { padding: 24 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#0f172a' },
  label: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 14, marginBottom: 14, fontSize: 14 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12 },
  cancelButton: { paddingVertical: 12, paddingHorizontal: 18 },
  cancelText: { color: '#64748b', fontWeight: '600' },
  submitButton: { backgroundColor: '#0f172a', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  submitText: { color: 'white', fontWeight: 'bold' },
});