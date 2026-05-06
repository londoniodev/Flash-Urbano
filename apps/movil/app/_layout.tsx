import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';

// LOGGING EXTREMO PARA DEPURACIÓN
const logs: string[] = [];
function log(msg: string) {
  const timestamp = new Date().toLocaleTimeString();
  const entry = `[${timestamp}] ${msg}`;
  console.log(entry);
  logs.push(entry);
}

log('Iniciando carga del bundle JS...');

// Prevenir ocultamiento automático
SplashScreen.preventAutoHideAsync().then(() => log('Splash preventAutoHideAsync OK')).catch(e => log('Splash error: ' + e.message));

// Forzar ocultamiento tras 5 segundos pase lo que pase
setTimeout(() => {
  log('Timeout de seguridad disparado - Forzando hideAsync');
  SplashScreen.hideAsync().catch(() => {});
}, 5000);

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  useEffect(() => {
    log('RootLayout montado');
    setDebugLogs([...logs]);
    
    const interval = setInterval(() => {
      setDebugLogs([...logs]);
    }, 1000);

    // Simular carga mínima para probar si el motor JS vive
    setTimeout(() => {
      log('Simulación de carga completada');
      setAppIsReady(true);
      SplashScreen.hideAsync().then(() => log('Splash hideAsync exitoso')).catch(e => log('Splash hide error: ' + e.message));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Si no estamos listos, mostramos un log en pantalla (si el splash se oculta por el timeout)
  if (!appIsReady) {
    return (
      <View style={styles.debugContainer}>
        <Text style={styles.debugTitle}>Depuración de Arranque</Text>
        <ScrollView style={styles.logScroll}>
          {debugLogs.map((l, i) => (
            <Text key={i} style={styles.logText}>{l}</Text>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Stack screenOptions={{ headerShown: false }} />
      {/* Botón flotante para ver logs */}
      <View style={{ position: 'absolute', bottom: 20, right: 20, opacity: 0.5 }}>
         <Text style={{ color: 'white', fontSize: 10 }}>JS Alive</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  debugContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 40,
    justifyContent: 'center',
  },
  debugTitle: {
    color: '#34D399',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  logScroll: {
    backgroundColor: '#000',
    borderRadius: 10,
    padding: 10,
    flex: 1,
  },
  logText: {
    color: '#0f0',
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 5,
  }
});
