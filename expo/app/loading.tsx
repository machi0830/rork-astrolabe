import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BackgroundView } from '@/components/BackgroundView';
import ConcentricCircles from '@/components/ConcentricCircles';
import Colors from '@/constants/colors';

export default function LoadingScreen() {
  return (
    <BackgroundView screenKey="OB1Screen" style={styles.flex}>
      <StatusBar style="light" />
      <View style={styles.center}>
        <ConcentricCircles />
        <View style={{ height: 24 }} />
        <Text style={styles.logo}>ASTROLABE</Text>
      </View>
    </BackgroundView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: {
    fontSize: 12,
    letterSpacing: 3,
    color: Colors.textDim,
    fontWeight: '500',
  },
});
