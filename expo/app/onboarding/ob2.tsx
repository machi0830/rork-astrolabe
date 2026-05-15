import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import {
  Telescope,
  Sparkle,
  Waves,
  Anchor,
} from 'lucide-react-native';
import { BackgroundView } from '@/components/BackgroundView';
import { PrimaryButton } from '@/components/Buttons';
import DotIndicator from '@/components/DotIndicator';
import Colors from '@/constants/colors';

type Feature = {
  Icon: typeof Telescope;
  title: string;
  sub: string;
  color: string;
};

const FEATURES: Feature[] = [
  {
    Icon: Telescope,
    title: '5つの視点で自分を観測する',
    sub: '内省の出発点を作る',
    color: Colors.attachment,
  },
  {
    Icon: Sparkle,
    title: '北極星を設定する',
    sub: '長期的な自己像を言語化する',
    color: Colors.gold,
  },
  {
    Icon: Waves,
    title: '感情を深掘りする',
    sub: 'なぜなぜで根っこに気づく',
    color: Colors.relation,
  },
  {
    Icon: Anchor,
    title: '小さな習慣を育てる',
    sub: 'If-Thenルールで行動を変える',
    color: Colors.assertion,
  },
];

export default function OB2() {
  const router = useRouter();
  return (
    <BackgroundView screenKey="OB1Screen" style={styles.flex}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.top}>
            <Text style={styles.logo}>ASTROLABE</Text>
          </View>

          <View style={styles.list}>
            {FEATURES.map((f, i) => {
              const Icon = f.Icon;
              return (
                <View key={i} style={styles.card}>
                  <View style={[styles.iconWrap, { borderColor: f.color }]}>
                    <Icon size={16} color={f.color} strokeWidth={1.5} />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>{f.title}</Text>
                    <Text style={styles.cardSub}>{f.sub}</Text>
                  </View>
                </View>
              );
            })}

            <View style={styles.warning}>
              <Text style={styles.warningText}>
                これは臨床的な心理診断ではありません。あなたの自己理解を深めるための内省ツールです。
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <PrimaryButton
              label="次へ"
              onPress={() => router.push('/onboarding/ob3')}
            />
            <View style={{ height: 20 }} />
            <DotIndicator total={3} active={1} />
          </View>
        </View>
      </SafeAreaView>
    </BackgroundView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 24 },
  container: { flex: 1, paddingVertical: 24, justifyContent: 'space-between' },
  top: { alignItems: 'center' },
  logo: {
    fontSize: 12,
    letterSpacing: 3,
    color: Colors.textDim,
    fontWeight: '500',
  },
  list: { gap: 10 },
  card: {
    backgroundColor: Colors.surfaceDeep,
    borderRadius: 9,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: { flex: 1 },
  cardTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textPrimary,
    lineHeight: 13 * 1.6,
  },
  cardSub: {
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 11 * 1.6,
    marginTop: 2,
  },
  warning: {
    backgroundColor: '#100808',
    borderLeftWidth: 2,
    borderLeftColor: '#804040',
    borderRadius: 7,
    padding: 10,
    marginTop: 4,
  },
  warningText: {
    fontSize: 11,
    color: '#7A4040',
    lineHeight: 11 * 1.75,
  },
  footer: { alignItems: 'stretch' },
});
