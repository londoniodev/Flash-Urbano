import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert, Image, Dimensions } from 'react-native';
import { router, Redirect } from 'expo-router';
import { COLORS, FONT_SIZE, SPACING, RADIUS } from '../../src/constants/theme';
import { Input, Button } from '../../src/components/Alvarosky';
import { useAuth } from '../../src/context/AuthContext';

const { width } = Dimensions.get('window');

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
      Alert.alert('Campos requeridos', 'Por favor ingresa tu correo y contraseña.');
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
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.title}>Flash Urbano</Text>
          <Text style={styles.subtitle}>Sistema de Gestión de Inventario</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input 
            label="Correo Electrónico" 
            placeholder="operario@flashurbano.com"
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
            title="Iniciar Sesión" 
            onPress={handleLogin} 
            loading={loading}
            style={styles.btn}
          />
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Operación segura · v1.0.0
        </Text>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logo: {
    width: width * 0.3,
    height: width * 0.3,
  },
  header: {
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
    color: COLORS.dark.text,
    letterSpacing: -0.5,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.dark.textMuted,
    letterSpacing: 0.5,
  },
  form: {
    width: '100%',
  },
  btn: {
    marginTop: SPACING.md,
  },
  footer: {
    textAlign: 'center',
    color: COLORS.dark.textMuted,
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xl,
    letterSpacing: 0.5,
  },
});
