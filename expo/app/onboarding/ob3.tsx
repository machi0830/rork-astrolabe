import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle } from 'react-native-svg';
import { BackgroundView } from '@/components/BackgroundView';
import { PrimaryButton } from '@/components/Buttons';
import DotIndicator from '@/components/DotIndicator';
import ConcentricCircles from '@/components/ConcentricCircles';
import Colors from '@/constants/colors';

const DOT_COLORS = [
  Colors.attachment,
  Colors.bigfive,
  Colors.assertion,
  Colors.eq,
  Colors.relation,
];

const RING_SIZE = 120;
const RADIUS = 40;

function OrbitDots() {
  const cx = RING_SIZE / 2;
  const cy = RING_SIZE / 2;
  return (
    <Svg
      width={RING_SIZE}
      height={RING_SIZE}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      {DOT_COLORS.map((c, i) => {
        const angle = (i / DOT_COLORS.length) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * RADIUS;
        const y = cy + Math.sin(angle) * RADIUS;
        return <Circle key={i} cx={x} cy={y} r={3} fill={c} />;
      })}
    </Svg>
  );
}

export default function OB3() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  const complete = async () => {
    try {
      await AsyncStorage.setItem('onboarding_completed', 'true');
    } catch (e) {
      console.log('[onboarding] failed to persist completion', e);
    }
  };

  const onStart = async () => {
    setLoading(true);
    await complete();
    setLoading(false);
    router.replace('/(tabs)/observation/flow');
  };

  const onSkip = async () => {
    await complete();
    router.replace('/(tabs)/observation');
  };

  return (
    <BackgroundView screenKey="OB3Screen" style={styles.flex}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.top}>
            <Text style={styles.logo}>ASTROLABE</Text>
          </View>

          <View style={styles.center}>
            <View style={styles.ringWrap}>
              <OrbitDots />
              <ConcentricCircles />
            </View>
            <View style={{ height: 36 }} />
            <Text style={styles.title}>準備ができました</Text>
            <Text style={styles.sub}>
              まず5つの視点で現在地を観測しましょう
            </Text>
          </View>

          <View style={styles.footer}>
            <PrimaryButton
              label="観測を始める"
              onPress={onStart}
              loading={loading}
            />
            <Pressable onPress={onSkip} hitSlop={12}>
              <Text style={styles.skip}>今はスキップする</Text>
            </Pressable>
            <View style={{ height: 8 }} />
            <DotIndicator total={3} active={2} />
          </View>
        </View>
      </SafeAreaView>
    </BackgroundView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 24 },
  container: { flex: 1, paddingVertical: 32, justifyContent: 'space-between' },
  top: { alignItems: 'center', paddingTop: 24 },
  logo: {
    fontSize: 12,
    letterSpacing: 3,
    color: Colors.textDim,
    fontWeight: '500',
  },
  center: { alignItems: 'center', justifyContent: 'center' },
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 15 * 1.75,
  },
  sub: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 12 * 1.75,
  },
  footer: { alignItems: 'stretch', gap: 12 },
  skip: {
    fontSize: 12,
    color: Colors.textDim,
    textAlign: 'center',
    marginTop: 12,
  },
});
