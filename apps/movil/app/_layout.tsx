import React, { useEffect, useCallback, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import * as Updates from 'expo-updates';
import { runMigrations } from '../src/db/migrations';
import { COLORS } from '../src/constants/theme';
import { AuthProvider, useAuth } from '../src/context/AuthContext';

export { ErrorBoundary } from 'expo-router';

function RootLayoutNav() {
  const { isLoading, user } = useAuth();

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

  if (error) {
    return (
      <View style={[styles.container, styles.centered, { padding: 20 }]}>
        <Text style={[styles.title, { color: '#F87171' }]}>Error de Arranque</Text>
        <ScrollView style={{ marginTop: 20, maxHeight: 300 }}>
          <Text style={{ color: 'white', fontFamily: 'monospace' }}>{error}</Text>
        </ScrollView>
        <Text style={{ color: 'gray', marginTop: 20 }}>Por favor reporta este error.</Text>
      </View>
    );
  }

  if (!appIsReady) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.title}>Flash Urbano</Text>
        <Text style={styles.subtitle}>{status}</Text>
      </View>
    );
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
  }
});
