import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { BackgroundView } from '@/components/BackgroundView';
import { Card, InnerCard } from '@/components/Card';
import { PrimaryButton, SecondaryButton } from '@/components/Buttons';
import Typo from '@/components/Typography';
import Colors from '@/constants/colors';
import { DOMAINS } from '@/constants/domains';
import AstrolabeChart from '@/components/AstrolabeChart';
import { useDiagnostic } from '@/hooks/useDiagnostic';
import { usePlan } from '@/hooks/usePlan';
import { Pressable } from 'react-native';

const formatDate = (iso: string) => {
  try {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  } catch {
    return '';
  }
};

export default function DiagnosticHome() {
  const router = useRouter();
  const { result, canReobserve, reobserveAvailableAt } = useDiagnostic();
  const { plan, isPro, setPlan } = usePlan();

  const hasResult = !!result;

  const reobserveLabel = useMemo(() => {
    if (!hasResult) return null;
    if (canReobserve) return null;
    if (!reobserveAvailableAt) return null;
    return `再観測は ${formatDate(reobserveAvailableAt.toISOString())} から`;
  }, [hasResult, canReobserve, reobserveAvailableAt]);

  return (
    <BackgroundView screenKey="DiagnosticHomeScreen" style={styles.flex}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Typo variant="eyebrow">OBSERVATION</Typo>
          <View style={{ height: 12 }} />
          <Typo variant="title">観測</Typo>
          <View style={{ height: 8 }} />
          <Typo variant="body">
            5つの視点から、あなたの現在地を観測します。{'\n'}
            星のように、ここに記録されます。
          </Typo>

          <View style={{ height: 24 }} />

          <Card style={styles.chartCard}>
            <View style={styles.chartWrap}>
              <AstrolabeChart size={220} scores={result?.scores} />
            </View>

            {result ? (
              <Typo variant="muted" style={styles.observedAt}>
                OBSERVED  {formatDate(result.createdAt)}
              </Typo>
            ) : (
              <Typo variant="muted" style={styles.observedAt}>
                UNOBSERVED
              </Typo>
            )}

            <View style={styles.scoreList}>
              {DOMAINS.map((d) => {
                const score = result?.scores[d.id] ?? 0;
                return (
                  <View key={d.id} style={styles.scoreRow}>
                    <Typo style={[styles.scoreLabel, { color: d.color }]}>
                      {d.label}
                    </Typo>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            width: `${score}%`,
                            backgroundColor: d.color,
                          },
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
          </Card>

          <View style={{ height: 20 }} />

          <InnerCard>
            <Typo variant="muted">
              {isPro ? 'PRECISE  OBSERVATION' : hasResult ? 'RE - OBSERVE' : 'BEGIN  OBSERVATION'}
            </Typo>
            <View style={{ height: 10 }} />
            <Typo variant="body">
              {isPro
                ? '50の問いで、5つの視点を細かく観測します。約10分。'
                : hasResult
                ? '観測は90日に一度。ゆっくりと変化を見守ります。'
                : '20の問いで、あなたの現在地を観測します。約5分。'}
            </Typo>
            <View style={{ height: 16 }} />
            {isPro ? (
              <PrimaryButton
                label={hasResult ? '精密観測をやり直す' : '精密観測を始める（50問）'}
                onPress={() => router.push('/(tabs)/observation/proflow')}
              />
            ) : (
              <PrimaryButton
                label={hasResult ? '再観測する（20問）' : '観測を始める（20問）'}
                onPress={() => router.push('/(tabs)/observation/flow')}
                disabled={hasResult && !canReobserve}
              />
            )}
            {!isPro && hasResult && reobserveLabel ? (
              <>
                <View style={{ height: 10 }} />
                <Typo variant="muted" style={{ textAlign: 'center' }}>
                  {reobserveLabel}
                </Typo>
              </>
            ) : null}
            {isPro && hasResult ? (
              <>
                <View style={{ height: 10 }} />
                <SecondaryButton
                  label="前回の精密結果を見る"
                  onPress={() => router.push('/(tabs)/observation/proresult')}
                />
              </>
            ) : null}
          </InnerCard>

          <View style={{ height: 18 }} />

          {/* 開発用プラン切り替え（MVP段階のみ） */}
          <Pressable
            onPress={() => setPlan(isPro ? 'trial' : 'standard')}
            style={styles.devToggle}
          >
            <Typo style={styles.devToggleText}>
              開発モード：プラン = {plan}（タップで切替）
            </Typo>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </BackgroundView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 24 },
  scroll: { paddingVertical: 24, paddingBottom: 48 },
  chartCard: { alignItems: 'stretch' },
  chartWrap: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  observedAt: {
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 18,
    fontSize: 10,
    letterSpacing: 3,
  },
  scoreList: { gap: 12 },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scoreLabel: {
    width: 96,
    fontSize: 12,
    letterSpacing: 1,
  },
  barTrack: {
    flex: 1,
    height: 2,
    borderRadius: 1,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 1,
  },
  scoreNum: {
    width: 36,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '500',
  },
  devToggle: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  devToggleText: {
    fontSize: 10,
    letterSpacing: 1,
    color: Colors.textDim,
  },
});
