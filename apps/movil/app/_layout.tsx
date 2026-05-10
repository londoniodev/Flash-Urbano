import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Text } from 'react-native';
import * as Updates from 'expo-updates';
import * as SplashScreen from 'expo-splash-screen';
import { runMigrations } from '../src/db/migrations';
import { COLORS } from '../src/constants/theme';
import { AuthProvider, useAuth } from '../src/context/AuthContext';

export { ErrorBoundary } from 'expo-router';

// Previene que el splash screen se oculte automáticamente
SplashScreen.preventAutoHideAsync().catch(() => {});

function RootLayoutNav() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.title}>Flash Urbano</Text>
        <Text style={styles.subtitle}>Verificando sesión...</Text>
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

  // Timeout de seguridad: ocultar splash después de 5 segundos pase lo que pase
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      console.log('[RootLayout] Safety timeout: forcing splash hide');
      SplashScreen.hideAsync().catch(() => {});
      setAppIsReady(true);
    }, 5000);

    return () => clearTimeout(safetyTimeout);
  }, []);

  useEffect(() => {
    async function prepareApp() {
      try {
        console.log('[RootLayout] Starting app preparation...');
        
        await runMigrations();
        console.log('[RootLayout] Migrations completed');

        if (!__DEV__) {
          try {
            const update = await Updates.checkForUpdateAsync();
            console.log('[RootLayout] Update check:', update.isAvailable);
            if (update.isAvailable) {
              await Updates.fetchUpdateAsync();
              await Updates.reloadAsync();
            }
          } catch (e) {
            console.log('[RootLayout] Update check skipped:', e);
          }
        }
      } catch (e) {
        console.warn('[RootLayout] Error during app preparation:', e);
      } finally {
        console.log('[RootLayout] App preparation finished, setting ready');
        setAppIsReady(true);
      }
    }

    prepareApp();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      console.log('[RootLayout] App is ready, hiding splash screen');
      SplashScreen.hideAsync().catch((err) => {
        console.warn('[RootLayout] Failed to hide splash:', err);
      });
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  subtitle: {
    color: COLORS.dark.textMuted,
    marginTop: 10,
    fontSize: 16,
  },
});
