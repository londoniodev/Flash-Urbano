import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZE } from '../../src/constants/theme';
import { useSync } from '../../src/hooks/useSync';

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const colors = COLORS.dark;
  return (
    <Text
      style={{
        color: focused ? colors.primary : colors.textMuted,
        fontSize: FONT_SIZE.xs,
        fontWeight: focused ? '700' : '400',
      }}
    >
      {label}
    </Text>
  );
}

export default function TabsLayout() {
  const { pendingCount } = useSync();
  const colors = COLORS.dark;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: FONT_SIZE.xs,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'Escanear',
          tabBarIcon: ({ focused }) => <TabIcon label="📷" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="kardex"
        options={{
          title: 'Kardex',
          tabBarIcon: ({ focused }) => <TabIcon label="📋" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="sync"
        options={{
          title: 'Sync',
          tabBarIcon: ({ focused }) => <TabIcon label="🔄" focused={focused} />,
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.danger,
            color: colors.textInverse,
            fontSize: FONT_SIZE.xs,
          },
        }}
      />
    </Tabs>
  );
}
