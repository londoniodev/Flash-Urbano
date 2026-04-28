import React, { useEffect, useCallback, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Text } from 'react-native';
import * as Updates from 'expo-updates';
import * as SplashScreen from 'expo-splash-screen';
import { runMigrations } from '../src/db/migrations';
import { COLORS } from '../src/constants/theme';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { useRouter, useSegments, useRootNavigationState } from 'expo-router';

// Exporting ErrorBoundary enables Expo Router's built-in error screen
// which will catch unhandled React crashes instead of showing a grey screen.
export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync().catch(() => {
  /* catch silence */
});

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const rootNavigationState = useRootNavigationState();
  const isNavigationReady = rootNavigationState?.key != null;

  useEffect(() => {
    // Si la navegación no está lista o seguimos cargando, no hacer nada
    if (!isNavigationReady || isLoading) return;

    const inAuthGroup = segments[0] === 'auth';
    const isRoot = !segments[0];

    if (!user && !inAuthGroup) {
      // Si no hay usuario y no estamos en auth, forzar login
      router.replace('/auth/login');
    } else if (user && (inAuthGroup || isRoot)) {
      // Si hay usuario y está en auth o en la raíz, enviarlo al home
      router.replace('/(tabs)/scanner');
    }
  }, [user, isLoading, segments, isNavigationReady]);

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
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepareApp() {
      try {
        // 1. Correr migraciones de forma asíncrona
        await runMigrations();

        // 2. Forzar búsqueda de actualizaciones en background
        if (!__DEV__) {
          Updates.checkForUpdateAsync().then(async (update) => {
            if (update.isAvailable) {
              await Updates.fetchUpdateAsync();
              await Updates.reloadAsync();
            }
          }).catch((error) => console.log('Update check skipped:', error));
        }
      } catch (e) {
        console.warn('Error during app preparation:', e);
      } finally {
        // Indica que la aplicación ya cargó dependencias iniciales
        setAppIsReady(true);
      }
    }

    prepareApp();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // Ocultar el splash screen nativo
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <AuthProvider>
      <View style={styles.container} onLayout={onLayoutRootView}>
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
