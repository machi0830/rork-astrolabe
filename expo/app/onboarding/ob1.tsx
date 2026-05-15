import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { BackgroundView } from '@/components/BackgroundView';
import { PrimaryButton } from '@/components/Buttons';
import DotIndicator from '@/components/DotIndicator';
import ConcentricCircles from '@/components/ConcentricCircles';
import Colors from '@/constants/colors';

export default function OB1() {
  const router = useRouter();
  return (
    <BackgroundView screenKey="OB1Screen" style={styles.flex}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.top}>
            <Text style={styles.logo}>ASTROLABE</Text>
          </View>

          <View style={styles.center}>
            <ConcentricCircles />
            <View style={{ height: 36 }} />
            <Text style={styles.line1}>感情の嵐に翻弄されるのでなく</Text>
            <View style={styles.divider} />
            <Text style={styles.line2}>冷静に海図を読み、自律して航海する</Text>
          </View>

          <View style={styles.footer}>
            <PrimaryButton
              label="→ 続ける"
              onPress={() => router.push('/onboarding/ob2')}
            />
            <View style={{ height: 20 }} />
            <DotIndicator total={3} active={0} />
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
  line1: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 13 * 1.8,
  },
  divider: {
    width: 28,
    height: 0.5,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  line2: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 13 * 1.8,
  },
  footer: { alignItems: 'stretch' },
});
