import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { X } from 'lucide-react-native';
import { BackgroundView } from '@/components/BackgroundView';
import Typo from '@/components/Typography';
import Colors from '@/constants/colors';
import { DOMAINS, DOMAIN_BY_ID, type DomainId } from '@/constants/domains';
import { QUESTIONS_50, PRO_DOMAIN_BOUNDARIES } from '@/constants/questions50';
import { calcScores50 } from '@/lib/scoring50';
import { useDiagnostic } from '@/hooks/useDiagnostic';

const PROGRESS_KEY = 'pro_diagnostic_progress';
const RESULT_TMP_KEY = 'pro_diagnostic_last_result';

const LIKERT: { value: number; label: string }[] = [
  { value: 1, label: '全く\nそう思わない' },
  { value: 2, label: 'そう\n思わない' },
  { value: 3, label: 'どちらでも\nない' },
  { value: 4, label: 'そう\n思う' },
  { value: 5, label: 'とても\nそう思う' },
];

export default function ProDiagnosticFlow() {
  const router = useRouter();
  const { saveResult50 } = useDiagnostic();

  const [currentQ, setCurrentQ] = useState<number>(0);
  const [answers, setAnswers] = useState<number[]>(() => new Array(50).fill(0));
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showDomainCard, setShowDomainCard] = useState<DomainId | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [resumeChecked, setResumeChecked] = useState<boolean>(false);

  const domainCardOpacity = useRef(new Animated.Value(0)).current;

  const q = QUESTIONS_50[currentQ];
  const currentDomain = useMemo(() => DOMAIN_BY_ID[q.domain], [q.domain]);
  const currentDomainIdx = DOMAINS.findIndex((d) => d.id === currentDomain.id);

  // 起動時：途中保存の確認
  useEffect(() => {
    if (resumeChecked) return;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(PROGRESS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as { currentQ: number; answers: number[] };
          if (
            parsed &&
            typeof parsed.currentQ === 'number' &&
            Array.isArray(parsed.answers) &&
            parsed.currentQ > 0 &&
            parsed.currentQ < QUESTIONS_50.length
          ) {
            Alert.alert(
              '前回の続きがあります',
              `${parsed.currentQ} 問目まで回答済みです。\n続きから始めますか？`,
              [
                {
                  text: '最初からやり直す',
                  style: 'destructive',
                  onPress: async () => {
                    await AsyncStorage.removeItem(PROGRESS_KEY);
                    setResumeChecked(true);
                  },
                },
                {
                  text: '続きから始める',
                  onPress: () => {
                    setCurrentQ(parsed.currentQ);
                    const filled = new Array(50).fill(0);
                    parsed.answers.forEach((v, i) => {
                      filled[i] = v;
                    });
                    setAnswers(filled);
                    setResumeChecked(true);
                  },
                },
              ],
              { cancelable: false }
            );
            return;
          }
        }
      } catch (e) {
        console.log('[proflow] resume check failed', e);
      }
      setResumeChecked(true);
    })();
  }, [resumeChecked]);

  const persistProgress = useCallback(async (qIdx: number, nextAnswers: number[]) => {
    try {
      await AsyncStorage.setItem(
        PROGRESS_KEY,
        JSON.stringify({ currentQ: qIdx, answers: nextAnswers })
      );
    } catch (e) {
      console.log('[proflow] persist failed', e);
    }
  }, []);

  const finalize = useCallback(
    async (final: number[]) => {
      setSubmitting(true);
      try {
        const scores = calcScores50(final);
        await AsyncStorage.setItem(RESULT_TMP_KEY, JSON.stringify(scores));
        await saveResult50(scores);
        await AsyncStorage.removeItem(PROGRESS_KEY);
      } catch (e) {
        console.log('[proflow] finalize failed', e);
      } finally {
        router.replace('/(tabs)/observation/proresult');
      }
    },
    [router, saveResult50]
  );

  const advanceFrom = useCallback(
    (qIndex: number, nextAnswers: number[]) => {
      if (qIndex >= QUESTIONS_50.length - 1) {
        finalize(nextAnswers);
        return;
      }
      if (PRO_DOMAIN_BOUNDARIES.has(qIndex)) {
        const completedDomain = QUESTIONS_50[qIndex].domain;
        setShowDomainCard(completedDomain);
        Animated.sequence([
          Animated.timing(domainCardOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.delay(500),
          Animated.timing(domainCardOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start(() => {
          setShowDomainCard(null);
          setCurrentQ(qIndex + 1);
          setSelectedIndex(null);
          persistProgress(qIndex + 1, nextAnswers);
        });
      } else {
        setCurrentQ(qIndex + 1);
        setSelectedIndex(null);
        persistProgress(qIndex + 1, nextAnswers);
      }
    },
    [domainCardOpacity, finalize, persistProgress]
  );

  const handleSelect = useCallback(
    (value: number) => {
      if (selectedIndex !== null || submitting) return;
      setSelectedIndex(value);
      const nextAnswers = [...answers];
      nextAnswers[currentQ] = value;
      setAnswers(nextAnswers);
      setTimeout(() => {
        advanceFrom(currentQ, nextAnswers);
      }, 400);
    },
    [selectedIndex, submitting, answers, currentQ, advanceFrom]
  );

  const handlePause = useCallback(() => {
    Alert.alert(
      '観測を中断しますか？',
      '途中までの回答は端末に保存されます。次回ここから再開できます。',
      [
        { text: '続ける', style: 'cancel' },
        {
          text: '中断する',
          style: 'destructive',
          onPress: async () => {
            await persistProgress(currentQ, answers);
            router.replace('/(tabs)/observation');
          },
        },
      ]
    );
  }, [currentQ, answers, persistProgress, router]);

  // 5セグメント（10問ごとに1セグメント）
  const segmentProgress = useMemo(() => {
    return DOMAINS.map((d, i) => {
      const segStart = i * 10;
      const segEnd = segStart + 10;
      const answered = answers.slice(segStart, segEnd).filter((v) => v > 0).length;
      const ratio = answered / 10;
      return { id: d.id, color: d.color, ratio };
    });
  }, [answers]);

  return (
    <BackgroundView screenKey="DiagnosticHomeScreen" style={styles.flex}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Typo
              variant="eyebrow"
              style={{ color: currentDomain.color, letterSpacing: 2 }}
            >
              {currentDomain.label.toUpperCase()}
            </Typo>
            <View style={styles.headerRight}>
              <Typo variant="muted">{currentQ + 1} / {QUESTIONS_50.length}</Typo>
              <Pressable
                onPress={handlePause}
                hitSlop={10}
                style={({ pressed }) => [styles.pauseBtn, pressed && styles.pressed]}
                accessibilityLabel="中断"
              >
                <X size={16} color={Colors.textMuted} />
              </Pressable>
            </View>
          </View>
          <View style={styles.progressRow}>
            {segmentProgress.map((seg, i) => {
              const isCurrent = i === currentDomainIdx;
              return (
                <View key={seg.id} style={styles.progressSegTrack}>
                  <View
                    style={[
                      styles.progressSegFill,
                      {
                        width: `${seg.ratio * 100}%`,
                        backgroundColor: seg.color,
                        opacity: isCurrent ? 1 : 0.7,
                      },
                    ]}
                  />
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.body}>
          <Typo style={styles.subdomainLabel}>
            {q.subdomain}
          </Typo>
          <Typo style={styles.questionText}>{q.text}</Typo>

          <View style={styles.likertWrap}>
            {LIKERT.map((opt) => {
              const selected = selectedIndex === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => handleSelect(opt.value)}
                  disabled={selectedIndex !== null || submitting}
                  style={({ pressed }) => [
                    styles.likertBtn,
                    selected && {
                      backgroundColor: currentDomain.color + '26',
                      borderColor: currentDomain.color,
                    },
                    pressed && selectedIndex === null ? styles.pressed : null,
                  ]}
                >
                  <Typo style={[styles.likertNum, selected && { color: currentDomain.color }]}>
                    {opt.value}
                  </Typo>
                  <Typo style={[styles.likertLabel, selected && { color: Colors.textPrimary }]}>
                    {opt.label}
                  </Typo>
                </Pressable>
              );
            })}
          </View>

          <Typo style={styles.scaleHint}>
            ← 全く そう思わない        とても そう思う →
          </Typo>
        </View>

        {showDomainCard ? (
          <Animated.View
            pointerEvents="none"
            style={[styles.domainCardOverlay, { opacity: domainCardOpacity }]}
          >
            <View
              style={[
                styles.domainCard,
                { borderColor: DOMAIN_BY_ID[showDomainCard].color },
              ]}
            >
              <Typo
                style={{
                  color: DOMAIN_BY_ID[showDomainCard].color,
                  fontSize: 14,
                  letterSpacing: 2,
                  textAlign: 'center',
                }}
              >
                {DOMAIN_BY_ID[showDomainCard].label}の観測 完了 ✓
              </Typo>
            </View>
          </Animated.View>
        ) : null}
      </SafeAreaView>
    </BackgroundView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 22, paddingVertical: 18 },
  header: { gap: 10 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pauseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceDeep,
  },
  progressRow: { flexDirection: 'row', gap: 3, marginTop: 4 },
  progressSegTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  progressSegFill: { height: '100%', borderRadius: 2 },
  body: { flex: 1, justifyContent: 'center' },
  subdomainLabel: {
    fontSize: 10,
    letterSpacing: 3,
    color: Colors.textDim,
    textAlign: 'center',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  questionText: {
    fontSize: 15,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
  },
  likertWrap: {
    flexDirection: 'row',
    gap: 6,
  },
  likertBtn: {
    flex: 1,
    height: 78,
    borderRadius: 10,
    backgroundColor: Colors.surfaceDeep,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  likertNum: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  likertLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 12,
  },
  scaleHint: {
    marginTop: 14,
    fontSize: 10,
    letterSpacing: 1,
    color: Colors.textDim,
    textAlign: 'center',
  },
  pressed: { opacity: 0.75 },
  domainCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  domainCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 18,
    paddingHorizontal: 28,
  },
});
