import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();

  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAuthSubmit = async () => {
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Email dan password wajib diisi.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password minimal terdiri dari 6 karakter.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (isRegisterMode) {
        await signUp(email.trim(), password);
        Alert.alert('Berhasil', 'Akun berhasil dibuat!');
      } else {
        await signIn(email.trim(), password);
      }
    } catch (error: any) {
      const msg = error?.message || 'Terjadi kesalahan saat autentikasi.';
      setErrorMessage(msg);
      Alert.alert('Autentikasi Gagal', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.innerContainer}
      >
        {/* BRAND LOGO */}
        <View style={styles.brandHeader}>
          <View style={styles.logoCircle}>
            <Ionicons name="shield-checkmark" size={32} color="#38bdf8" />
          </View>
          <Text style={styles.appTitle}>JagaKas</Text>
          <Text style={styles.appSubtitle}>
            {isRegisterMode ? 'Buat akun baru untuk mengamankan aset' : 'Masuk ke dompet & portofolio kripto'}
          </Text>
        </View>

        {/* FORM CARD */}
        <View style={styles.card}>
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color="#dc2626" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color="#94a3b8" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input}
              placeholder="nama@email.com"
              placeholderTextColor="#94a3b8"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              editable={!isSubmitting}
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color="#94a3b8" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input}
              placeholder="Minimal 6 karakter"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!isSubmitting}
            />
          </View>

          {/* TOMBOL SUBMIT DENGAN LOADING STATE */}
          <Pressable
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleAuthSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.submitText}>
                {isRegisterMode ? 'Daftar Sekarang' : 'Masuk'}
              </Text>
            )}
          </Pressable>

          {/* TOGGLE SIGN IN / SIGN UP */}
          <Pressable
            style={styles.switchModeButton}
            onPress={() => {
              setIsRegisterMode((prev) => !prev);
              setErrorMessage(null);
            }}
            disabled={isSubmitting}
          >
            <Text style={styles.switchModeText}>
              {isRegisterMode
                ? 'Sudah punya akun? Masuk di sini'
                : 'Belum punya akun? Daftar baru'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  innerContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  brandHeader: { alignItems: 'center', marginBottom: 28 },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  appTitle: { fontSize: 26, fontWeight: 'bold', color: '#ffffff', letterSpacing: -0.5 },
  appSubtitle: { fontSize: 13, color: '#94a3b8', marginTop: 4, textAlign: 'center' },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 22,
    elevation: 4,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
    gap: 6,
  },
  errorText: { color: '#b91c1c', fontSize: 12, flex: 1 },
  label: { fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 6 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  input: { flex: 1, fontSize: 14, color: '#0f172a' },
  submitButton: {
    backgroundColor: '#0f172a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  switchModeButton: { marginTop: 16, alignItems: 'center' },
  switchModeText: { color: '#0284c7', fontSize: 13, fontWeight: '600' },
});