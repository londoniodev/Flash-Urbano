import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, FONT_SIZE, RADIUS } from '../../constants/theme';

interface BadgeProps {
  count: number;
  variant?: 'primary' | 'danger' | 'warning';
  style?: ViewStyle;
}

export function Badge({ count, variant = 'primary', style }: BadgeProps) {
  const colors = COLORS.dark;

  const bgColor = {
    primary: colors.primary,
    danger: colors.danger,
    warning: colors.warning,
  }[variant];

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }, style]}>
      <Text style={styles.text}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  text: {
    color: COLORS.dark.textInverse,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
});
