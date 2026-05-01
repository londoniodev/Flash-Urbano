import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { router, Redirect } from 'expo-router';
import { COLORS, FONT_SIZE, SPACING } from '../../src/constants/theme';
import { Input, Button } from '../../src/components/Alvarosky';
import { useAuth } from '../../src/context/AuthContext';

export default function LoginScreen() {
  const { user, isLoading, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const colors = COLORS.dark;

  if (!isLoading && user) {
    return <Redirect href="/(tabs)/scanner" />;
  }

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa credenciales válidas.');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(tabs)/scanner');
    } catch (error: any) {
      Alert.alert('Error de Autenticación', error.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Flash Urbano</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Identificación de Operario
          </Text>
        </View>

        <View style={styles.form}>
          <Input 
            label="Correo Electrónico" 
            placeholder="operario@bodega.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <Input 
            label="Contraseña" 
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Button 
            title="Ingresar" 
            onPress={handleLogin} 
            loading={loading}
            style={styles.btn}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
  },
  form: {
    width: '100%',
  },
  btn: {
    marginTop: SPACING.md,
  }
});
