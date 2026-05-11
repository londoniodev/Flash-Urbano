import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { View, Text, StyleSheet, Image } from 'react-native';
import { COLORS, FONT_SIZE, SPACING, RADIUS } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';

// Simple icon components using View + shapes (no emoji)
function ScanIcon({ focused, color }: { focused: boolean; color: string }) {
  return (
    <View style={[iconStyles.scanBox, { borderColor: color }]}>
      <View style={[iconStyles.scanLine, { backgroundColor: color }]} />
    </View>
  );
}

function KardexIcon({ focused, color }: { focused: boolean; color: string }) {
  return (
    <View style={iconStyles.kardexBox}>
      <View style={[iconStyles.kardexLine, { backgroundColor: color, width: 16 }]} />
      <View style={[iconStyles.kardexLine, { backgroundColor: color, width: 12, opacity: 0.6 }]} />
      <View style={[iconStyles.kardexLine, { backgroundColor: color, width: 14, opacity: 0.4 }]} />
    </View>
  );
}

function SyncIcon({ focused, color }: { focused: boolean; color: string }) {
  return (
    <View style={iconStyles.syncBox}>
      <View style={[iconStyles.syncArrow, { borderColor: color }]} />
      <View style={[iconStyles.syncDot, { backgroundColor: color }]} />
    </View>
  );
}

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const { user, isLoading } = useAuth();
  const insets = useSafeAreaInsets();
  const colors = COLORS.dark;

  if (isLoading) return null;

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          // Eliminamos el height fijo y usamos insets para el padding
          height: 60 + (insets.bottom > 0 ? insets.bottom - 10 : 10),
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 10,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: FONT_SIZE.xs,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'Escanear',
          tabBarIcon: ({ focused, color }) => <ScanIcon focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="kardex"
        options={{
          title: 'Kardex',
          tabBarIcon: ({ focused, color }) => <KardexIcon focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="sync"
        options={{
          href: null, // Ocultar de la barra de navegación
        }}
      />
    </Tabs>
  );
}

const iconStyles = StyleSheet.create({
  // Scan icon: viewfinder/crosshair
  scanBox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanLine: {
    width: 10,
    height: 2,
    borderRadius: 1,
  },
  // Kardex icon: list lines
  kardexBox: {
    width: 22,
    height: 18,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 1,
  },
  kardexLine: {
    height: 2.5,
    borderRadius: 1.5,
  },
  // Sync icon: circular arrow
  syncBox: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncArrow: {
    width: 18,
    height: 18,
    borderWidth: 2.5,
    borderRadius: 9,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  syncDot: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
    top: 1,
    right: 5,
  },
});
