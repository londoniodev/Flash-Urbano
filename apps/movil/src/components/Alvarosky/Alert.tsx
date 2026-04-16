import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, FONT_SIZE, SPACING, RADIUS } from '../../constants/theme';

type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  message: string;
  variant?: AlertVariant;
  style?: ViewStyle;
}

export function Alert({ message, variant = 'info', style }: AlertProps) {
  const colors = COLORS.dark;

  const config: Record<AlertVariant, { bg: string; text: string }> = {
    success: { bg: colors.primaryMuted, text: colors.primary },
    error: { bg: colors.dangerMuted, text: colors.danger },
    warning: { bg: colors.warningMuted, text: colors.warning },
    info: { bg: colors.surface, text: colors.text },
  };

  const { bg, text } = config[variant];

  return (
    <View style={[styles.container, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, { color: text }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
  },
  text: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
  },
});
