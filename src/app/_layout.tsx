import { AuthProvider, useAuth } from '@/context/AuthContext';
import { FinanceProvider } from '@/context/FinanceContext';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

function RootLayoutNav() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Tunggu proses pengecekan token di SecureStore selesai
    if (isLoading) return;

    const inLoginScreen = segments[0] as string === 'login';

    if (!session && !inLoginScreen) {
      // Belum login -> blokir akses dan arahkan ke halaman login
      router.replace('/login' as any);
    } else if (session && inLoginScreen) {
      // Sudah login -> langsung masuk ke dashboard
      router.replace('/' as any);
    }
  }, [session, isLoading, segments]);

  // Tampilkan loading spinner saat aplikasi membaca sesi dari SecureStore
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#0f172a" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#f8fafc' },
      }}
    >
      {/* Rute Autentikasi */}
      <Stack.Screen name="login" />

      {/* Rute Terproteksi */}
      <Stack.Screen name="index" />
      <Stack.Screen
        name="add-transaction"
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      {/* Rute Settings */}
      <Stack.Screen
        name="settings"
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <RootLayoutNav />
      </FinanceProvider>
    </AuthProvider>
  );
}