import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { View, Text, StyleSheet, Image } from 'react-native';
import { COLORS, FONT_SIZE, SPACING, RADIUS } from '../../src/constants/theme';
import { useSync } from '../../src/hooks/useSync';
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

export default function TabsLayout() {
  const { user, isLoading } = useAuth();
  const { pendingCount } = useSync();
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
          height: 68,
          paddingBottom: 10,
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
          title: 'Sync',
          tabBarIcon: ({ focused, color }) => <SyncIcon focused={focused} color={color} />,
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.danger,
            color: '#FFF',
            fontSize: 10,
            fontWeight: '700',
            minWidth: 18,
            height: 18,
            lineHeight: 18,
            borderRadius: 9,
          },
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
