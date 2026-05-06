import React, { useEffect, useCallback, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import * as Updates from 'expo-updates';
import * as SplashScreen from 'expo-splash-screen';
import { runMigrations } from '../src/db/migrations';
import { COLORS } from '../src/constants/theme';
import { AuthProvider, useAuth } from '../src/context/AuthContext';

// Mantiene el splash screen visible hasta que estemos listos
SplashScreen.preventAutoHideAsync().catch(() => {
  /* silence */
});

export { ErrorBoundary } from 'expo-router';

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
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Iniciando...');

  useEffect(() => {
    async function prepareApp() {
      try {
        setStatus('Corriendo migraciones...');
        await runMigrations();

        if (!__DEV__) {
          setStatus('Buscando actualizaciones...');
          try {
            const update = await Updates.checkForUpdateAsync();
            if (update.isAvailable) {
              setStatus('Descargando actualización...');
              await Updates.fetchUpdateAsync();
              await Updates.reloadAsync();
            }
          } catch (updateError) {
            console.log('Update check failed:', updateError);
          }
        }
        
        setStatus('Todo listo');
        setAppIsReady(true);
      } catch (e: any) {
        console.error('Error crítico en el arranque:', e);
        setError(e.message || String(e));
      }
    }

    prepareApp();
  }, []);

  useEffect(() => {
    if (appIsReady || error) {
      // Ocultar el splash screen cuando estemos listos o tengamos un error que mostrar
      SplashScreen.hideAsync().catch(() => {
        /* silence */
      });
    }
  }, [appIsReady, error]);

  if (error) {
    return (
      <View style={[styles.container, styles.centered, { padding: 20 }]}>
        <Text style={[styles.title, { color: '#F87171' }]}>Error de Arranque</Text>
        <ScrollView style={{ marginTop: 20, maxHeight: 300 }}>
          <Text style={{ color: 'white', fontFamily: 'monospace' }}>{error}</Text>
        </ScrollView>
        <Button title="Reintentar" onPress={() => Updates.reloadAsync()} style={{ marginTop: 20 }} />
      </View>
    );
  }

  if (!appIsReady) {
    // Mientras appIsReady es false, el splash screen nativo sigue visible.
    // Retornamos null para no renderizar nada detrás del splash aún.
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

// Re-importar Button para el error screen
import { Button } from '../src/components/Alvarosky';

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
  }
});
