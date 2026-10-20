import { FinanceProvider } from '@/context/FinanceContext';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <FinanceProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#f8fafc' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen
          name="add-transaction"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
      </Stack>
    </FinanceProvider>
  );
}