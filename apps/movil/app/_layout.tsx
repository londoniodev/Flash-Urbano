import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import * as Updates from 'expo-updates';
import { runMigrations } from '../src/db/migrations';
import { COLORS } from '../src/constants/theme';
import { AuthProvider } from '../src/context/AuthContext';

export default function RootLayout() {
  useEffect(() => {
    // 1. Correr migraciones
    runMigrations();

    // 2. Forzar búsqueda de actualizaciones (Hot Reload en Producción)
    async function onFetchUpdateAsync() {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch (error) {
        // Ignorar errores en dev o sin red
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
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.dark.background },
            animation: 'fade',
          }}
        />
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
