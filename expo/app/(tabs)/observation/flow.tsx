import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { BackgroundView } from '@/components/BackgroundView';
import Typo from '@/components/Typography';
import Colors from '@/constants/colors';
import { DOMAINS, DOMAIN_BY_ID, type DomainId } from '@/constants/domains';
import { QUESTIONS_20 } from '@/constants/questions20';
import { useDiagnostic } from '@/hooks/useDiagnostic';

const DOMAIN_BOUNDARIES = new Set<number>([3, 7, 11, 15]);

export default function DiagnosticFlow() {
  const router = useRouter();
  const { saveResult } = useDiagnostic();

  const [currentQ, setCurrentQ] = useState<number>(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showDomainCard, setShowDomainCard] = useState<DomainId | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const domainCardOpacity = useRef(new Animated.Value(0)).current;

  const q = QUESTIONS_20[currentQ];
  const currentDomain = useMemo(() => DOMAIN_BY_ID[q.domain as DomainId], [q.domain]);

  const finalize = useCallback(async (final: number[]) => {
    setSubmitting(true);
    try {
      await saveResult(final);
    } finally {
      router.replace('/(tabs)/observation');
    }
  }, [saveResult, router]);

  const advanceFrom = useCallback((qIndex: number, nextAnswers: number[]) => {
    if (qIndex >= QUESTIONS_20.length - 1) {
      finalize(nextAnswers);
      return;
    }
    if (DOMAIN_BOUNDARIES.has(qIndex)) {
      const completedDomain = QUESTIONS_20[qIndex].domain as DomainId;
      setShowDomainCard(completedDomain);
      Animated.sequence([
        Animated.timing(domainCardOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.delay(500),
        Animated.timing(domainCardOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start(() => {
        setShowDomainCard(null);
        setCurrentQ(qIndex + 1);
        setSelectedIndex(null);
      });
    } else {
      setCurrentQ(qIndex + 1);
      setSelectedIndex(null);
    }
  }, [domainCardOpacity, finalize]);

  const handleSelect = useCallback((optIdx: number) => {
    if (selectedIndex !== null || submitting) return;
    setSelectedIndex(optIdx);
    const score = q.scores[optIdx];
    const nextAnswers = [...answers];
    nextAnswers[currentQ] = score;
    setAnswers(nextAnswers);
    setTimeout(() => {
      advanceFrom(currentQ, nextAnswers);
    }, 300);
  }, [selectedIndex, submitting, q, answers, currentQ, advanceFrom]);

  const currentDomainIdx = DOMAINS.findIndex((d) => d.id === currentDomain.id);

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
            <Typo variant="muted">{currentQ + 1} / {QUESTIONS_20.length}</Typo>
          </View>
          <View style={styles.progressRow}>
            {DOMAINS.map((d, i) => {
              const bg =
                i < currentDomainIdx
                  ? d.color
                  : i === currentDomainIdx
                  ? d.color
                  : Colors.border;
              const opacity = i === currentDomainIdx ? 1 : i < currentDomainIdx ? 0.6 : 1;
              return (
                <View
                  key={d.id}
                  style={[
                    styles.progressSeg,
                    { backgroundColor: bg, opacity },
                  ]}
                />
              );
            })}
          </View>
        </View>

        <View style={styles.body}>
          <Typo style={styles.questionText}>{q.text}</Typo>

          <View style={styles.optionsWrap}>
            {q.opts.map((opt, idx) => {
              const selected = selectedIndex === idx;
              return (
                <Pressable
                  key={`${q.id}-${idx}`}
                  onPress={() => handleSelect(idx)}
                  disabled={selectedIndex !== null || submitting}
                  style={({ pressed }) => [
                    styles.optionCard,
                    selected && styles.optionCardSelected,
                    pressed && selectedIndex === null ? styles.pressed : null,
                  ]}
                >
                  <Typo style={styles.optionText}>{opt}</Typo>
                </Pressable>
              );
            })}
          </View>
        </View>

        {showDomainCard ? (
          <Animated.View
            collapsable={undefined}
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
  progressRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 4,
  },
  progressSeg: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  body: { flex: 1, justifyContent: 'center' },
  questionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginVertical: 20,
  },
  optionsWrap: { gap: 8 },
  optionCard: {
    backgroundColor: Colors.surfaceDeep,
    borderRadius: 9,
    padding: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: Colors.starlight,
  },
  optionText: {
    color: Colors.textPrimary,
    fontSize: 13,
    lineHeight: 22,
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
