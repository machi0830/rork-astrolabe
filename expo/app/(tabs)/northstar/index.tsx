import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { BackgroundView } from '@/components/BackgroundView';
import { PrimaryButton } from '@/components/Buttons';
import Typo from '@/components/Typography';
import Colors from '@/constants/colors';
import { DOMAINS } from '@/constants/domains';
import { useDiagnostic } from '@/hooks/useDiagnostic';
import { useNorthStar } from '@/hooks/useNorthStar';

export default function NorthStarHome() {
  const router = useRouter();
  const { result } = useDiagnostic();
  const { data } = useNorthStar();

  const pulse = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    if (!data) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.0, duration: 1250, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.6, duration: 1250, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [data, pulse]);

  const hasObservation = !!result;
  const hasStar = !!data;

  return (
    <BackgroundView screenKey="NorthStarScreen" style={styles.flex}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Typo variant="eyebrow">NORTH  STAR</Typo>
          <View style={{ height: 12 }} />
          <Typo variant="title">北極星</Typo>

          <View style={{ height: 32 }} />

          {hasStar ? (
            <View style={styles.starBlock}>
              <Animated.Text style={[styles.starGlyph, { opacity: pulse }]}>✦</Animated.Text>
              <View style={{ height: 16 }} />
              <Typo style={styles.statement}>{data!.statement}</Typo>
              <View style={styles.divider} />
              <View style={styles.scoreList}>
                {DOMAINS.map((d) => {
                  const score = result?.scores[d.id] ?? 0;
                  return (
                    <View key={d.id} style={styles.scoreRow}>
                      <Typo style={[styles.scoreLabel, { color: d.color }]}>{d.label}</Typo>
                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.barFill,
                            { width: `${score}%`, backgroundColor: d.color },
                          ]}
                        />
                      </View>
                      <Typo style={[styles.scoreNum, { color: d.color }]}>
                        {result ? score : '—'}
                      </Typo>
                    </View>
                  );
                })}
              </View>

              <View style={{ height: 28 }} />
              <Pressable
                onPress={() => router.push('/(tabs)/northstar/generate?mode=edit')}
                hitSlop={12}
              >
                <Typo style={styles.editLink}>編集する</Typo>
              </Pressable>
            </View>
          ) : !hasObservation ? (
            <View style={styles.emptyBlock}>
              <View style={styles.banner}>
                <Typo style={styles.bannerText}>まず観測を行ってください</Typo>
                <View style={{ height: 6 }} />
                <Typo style={styles.bannerSub}>
                  5つの視点での観測が、{'\n'}北極星を導き出す素材になります。
                </Typo>
              </View>
              <View style={{ height: 24 }} />
              <PrimaryButton
                label="観測に進む"
                onPress={() => router.push('/(tabs)/observation')}
              />
            </View>
          ) : (
            <View style={styles.emptyBlock}>
              <Typo style={styles.lead}>あなたの北極星を設定しましょう</Typo>
              <View style={{ height: 24 }} />
              <PrimaryButton
                label="観測から北極星を生成する"
                onPress={() => router.push('/(tabs)/northstar/name')}
              />
            </View>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </BackgroundView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 24 },
  scroll: { paddingVertical: 28, paddingBottom: 48 },
  starBlock: { alignItems: 'center' },
  starGlyph: {
    fontSize: 32,
    color: Colors.gold,
    textAlign: 'center',
  },
  statement: {
    fontSize: 16,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: 6,
  },
  divider: {
    width: 40,
    height: 0.5,
    backgroundColor: Colors.border,
    marginVertical: 20,
  },
  scoreList: { gap: 12, alignSelf: 'stretch' },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  scoreLabel: { width: 96, fontSize: 12, letterSpacing: 1 },
  barTrack: {
    flex: 1,
    height: 2,
    borderRadius: 1,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 1 },
  scoreNum: { width: 36, textAlign: 'right', fontSize: 12, fontWeight: '500' },
  editLink: {
    fontSize: 12,
    color: Colors.textDim,
    textAlign: 'center',
    letterSpacing: 1,
  },
  emptyBlock: { paddingVertical: 24 },
  lead: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  banner: {
    backgroundColor: Colors.surfaceDeep,
    borderRadius: 10,
    borderLeftWidth: 2,
    borderLeftColor: Colors.starlight,
    padding: 14,
  },
  bannerText: {
    fontSize: 13,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  bannerSub: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 22,
  },
});
