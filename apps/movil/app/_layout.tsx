import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Text } from 'react-native';
import * as Updates from 'expo-updates';
import { runMigrations } from '../src/db/migrations';
import { COLORS } from '../src/constants/theme';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { useRouter, useSegments } from 'expo-router';

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!user && !inAuthGroup) {
      // Si no hay usuario y no estamos en auth, al login
      router.replace('/auth/login');
    } else if (user && inAuthGroup) {
      // Si hay usuario y estamos en auth, al home
      router.replace('/(tabs)/scanner');
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>Flash Urbano</Text>
        <Text style={{ color: 'gray', marginTop: 10 }}>Verificando sesión...</Text>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.dark.background },
        animation: 'fade',
      }}
    />
  );
}

export default function RootLayout() {
  useEffect(() => {
    // 1. Correr migraciones
    runMigrations();

    // 2. Forzar búsqueda de actualizaciones
    async function onFetchUpdateAsync() {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch (error) {
        console.log('Update check skipped:', error);
      }
    }

    if (!__DEV__) {
      onFetchUpdateAsync();
    }
  }, []);

  return (
    <AuthProvider>
      <View style={styles.container}>
        <StatusBar style="light" />
        <RootLayoutNav />
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark.background,
  },
});
