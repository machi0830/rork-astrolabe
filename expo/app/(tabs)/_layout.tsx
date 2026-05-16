import React from 'react';
import { Tabs, router } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { StyleSheet, Pressable } from 'react-native';
import Colors from '@/constants/colors';

export default function TabLayout() {
  const headerRight = () => (
    <Pressable
      onPress={() => router.push('/settings')}
      style={{ marginRight: 16 }}
    >
      <Ionicons name="settings-outline" size={22} color={Colors.starlight} />
    </Pressable>
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#050A18' },
        headerShadowVisible: false,
        headerTintColor: Colors.starlight,
        headerRight,
        tabBarActiveTintColor: Colors.starlight,
        tabBarInactiveTintColor: Colors.textDim,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.label,
        sceneStyle: { backgroundColor: Colors.background },
      }}
    >
      <Tabs.Screen
        name="observation"
        options={{
          title: '観察',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="telescope" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="northstar"
        options={{
          title: '北極星',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="star-four-points" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: '日誌',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="book-open-variant" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="wake"
        options={{
          title: '航跡',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-line" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    height: 76,
    paddingTop: 8,
    paddingBottom: 18,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1.5,
  },
});
