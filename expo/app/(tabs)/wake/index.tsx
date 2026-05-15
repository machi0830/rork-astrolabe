import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import Svg, { Circle, G, Line, Polyline, Text as SvgText } from 'react-native-svg';
import { BackgroundView } from '@/components/BackgroundView';
import Colors from '@/constants/colors';
import { DOMAINS, type DomainId } from '@/constants/domains';
import { GENRE_BY_ID } from '@/constants/genres';
import { useNorthStar } from '@/hooks/useNorthStar';
import { useIfThen, MAX_SLOTS } from '@/hooks/useIfThen';
import { useJournalSessions } from '@/hooks/useJournalSessions';
import { useDiagnostic, type DiagnosticHistoryEntry } from '@/hooks/useDiagnostic';

const CHART_W = 320;
const CHART_H = 180;
const CHART_PAD = { top: 16, right: 16, bottom: 28, left: 32 } as const;

const formatMMDD = (iso: string): string => {
  try {
    const d = new Date(iso);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${mm}.${dd}`;
  } catch {
    return '--.--';
  }
};

interface ChartProps {
  history: DiagnosticHistoryEntry[];
}

function TrendChart({ history }: ChartProps) {
  const innerW = CHART_W - CHART_PAD.left - CHART_PAD.right;
  const innerH = CHART_H - CHART_PAD.top - CHART_PAD.bottom;
  const n = history.length;

  const xFor = (i: number): number => {
    if (n <= 1) return CHART_PAD.left + innerW / 2;
    return CHART_PAD.left + (i / (n - 1)) * innerW;
  };
  const yFor = (v: number): number => {
    const clamped = Math.max(0, Math.min(100, v));
    return CHART_PAD.top + (1 - clamped / 100) * innerH;
  };

  const gridLines = [0, 25, 50, 75, 100];

  return (
    <Svg width="100%" height={CHART_H} viewBox={`0 0 ${CHART_W} ${CHART_H}`}>
      {gridLines.map((g) => {
        const y = yFor(g);
        return (
          <G key={`grid-${g}`}>
            <Line
              x1={CHART_PAD.left}
              x2={CHART_W - CHART_PAD.right}
              y1={y}
              y2={y}
              stroke={Colors.border}
              strokeWidth={0.5}
            />
            <SvgText
              x={CHART_PAD.left - 6}
              y={y + 3}
              fill={Colors.textDim}
              fontSize="8"
              textAnchor="end"
            >
              {g}
            </SvgText>
          </G>
        );
      })}
      {DOMAINS.map((d) => {
        const points = history.map((h, i) => `${xFor(i)},${yFor(h.scores[d.id] ?? 0)}`).join(' ');
        return (
          <G key={d.id}>
            <Polyline
              points={points}
              fill="none"
              stroke={d.color}
              strokeWidth={1.4}
              strokeOpacity={0.9}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {history.map((h, i) => (
              <Circle
                key={`${d.id}-${i}`}
                cx={xFor(i)}
                cy={yFor(h.scores[d.id] ?? 0)}
                r={2}
                fill={d.color}
              />
            ))}
          </G>
        );
      })}
      {history.map((h, i) => (
        <SvgText
          key={`xlabel-${i}`}
          x={xFor(i)}
          y={CHART_H - 10}
          fill={Colors.textDim}
          fontSize="8"
          textAnchor="middle"
        >
          {formatMMDD(h.createdAt)}
        </SvgText>
      ))}
    </Svg>
  );
}

export default function WakeView() {
  const router = useRouter();
  const { data: northStar } = useNorthStar();
  const { activeRules } = useIfThen();
  const { sessions } = useJournalSessions();
  const { history, result } = useDiagnostic();

  const effectiveHistory = useMemo<DiagnosticHistoryEntry[]>(() => {
    if (history && history.length > 0) return history;
    if (result) return [{ scores: result.scores, createdAt: result.createdAt }];
    return [];
  }, [history, result]);

  const enoughData = effectiveHistory.length >= 3;

  return (
    <BackgroundView screenKey="WakeViewScreen" style={styles.flex}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.eyebrow}>WAKE  ·  航跡</Text>
          <View style={{ height: 6 }} />
          <Text style={styles.subEyebrow}>あなたの自己理解の軌跡</Text>

          <View style={{ height: 22 }} />

          {/* 北極星カード */}
          <Pressable
            onPress={() => router.push('/(tabs)/northstar')}
            style={({ pressed }) => [styles.northCard, pressed ? styles.pressed : null]}
            testID="wake-northstar-card"
          >
            <View style={styles.northAccent} />
            <View style={styles.northBody}>
              <View style={styles.northRow}>
                <Text style={styles.northIcon}>✦</Text>
                <Text style={styles.northLabel}>NORTH STAR</Text>
              </View>
              <View style={{ height: 6 }} />
              <Text
                style={northStar?.statement ? styles.northText : styles.northTextMuted}
                numberOfLines={2}
              >
                {northStar?.statement ?? 'あなたの北極星を設定しましょう'}
              </Text>
            </View>
            <Text style={styles.chev}>›</Text>
          </Pressable>

          <View style={{ height: 14 }} />

          {/* If-Thenルールカード */}
          <Pressable
            onPress={() => router.push('/(tabs)/wake/ifthen')}
            style={({ pressed }) => [styles.ruleCard, pressed ? styles.pressed : null]}
            testID="wake-ifthen-card"
          >
            <Text style={styles.ruleAnchor}>⚓</Text>
            <View style={styles.ruleBody}>
              <Text style={styles.ruleTitle}>If-Then ルール</Text>
              <Text style={styles.ruleMeta}>
                {activeRules.length} / {MAX_SLOTS} スロット使用中
              </Text>
            </View>
            <Text style={styles.chev}>›</Text>
          </Pressable>

          <View style={{ height: 28 }} />

          {/* トレンドチャート */}
          <Text style={styles.sectionLabel}>TREND  ·  5  AXES</Text>
          <View style={{ height: 12 }} />
          <View style={styles.chartCard}>
            {enoughData ? (
              <>
                <TrendChart history={effectiveHistory} />
                <View style={{ height: 10 }} />
                <View style={styles.legend}>
                  {DOMAINS.map((d) => (
                    <View key={d.id} style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: d.color }]} />
                      <Text style={styles.legendText}>{d.label}</Text>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <View style={styles.chartEmpty}>
                <Text style={styles.chartEmptyIcon}>✧</Text>
                <View style={{ height: 10 }} />
                <Text style={styles.chartEmptyText}>
                  航跡は 3 回の観測から描かれます
                </Text>
                <View style={{ height: 6 }} />
                <Text style={styles.chartEmptySub}>
                  現在 {effectiveHistory.length} 回 / 3 回
                </Text>
              </View>
            )}
          </View>

          <View style={{ height: 28 }} />

          {/* セッション履歴 */}
          <Text style={styles.sectionLabel}>SESSIONS  ·  履歴</Text>
          <View style={{ height: 12 }} />
          {sessions.length === 0 ? (
            <View style={styles.sessionEmpty}>
              <Text style={styles.sessionEmptyText}>
                日誌を記録すると、ここに航跡が残ります
              </Text>
              <View style={{ height: 14 }} />
              <Pressable
                onPress={() => router.push('/(tabs)/journal')}
                style={({ pressed }) => [styles.sessionStart, pressed ? { opacity: 0.7 } : null]}
                testID="wake-start-journal"
              >
                <Text style={styles.sessionStartText}>日誌を始める  →</Text>
              </Pressable>
            </View>
          ) : (
            sessions.map((s) => {
              const g = GENRE_BY_ID[s.genre] ?? GENRE_BY_ID.anxiety;
              return (
                <View
                  key={s.id}
                  style={[styles.sessionCard, { borderLeftColor: g.color }]}
                  testID={`session-${s.id}`}
                >
                  <Text style={styles.sessionEmoji}>{g.emoji}</Text>
                  <View style={styles.sessionTextWrap}>
                    <Text style={styles.sessionLabel}>{g.label}</Text>
                    {s.layerAnswers && s.layerAnswers.length > 0 ? (
                      <Text style={styles.sessionPreview} numberOfLines={1}>
                        {s.layerAnswers[s.layerAnswers.length - 1]}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={styles.sessionDate}>{formatMMDD(s.createdAt)}</Text>
                </View>
              );
            })
          )}

          <View style={{ height: 48 }} />
        </ScrollView>
      </SafeAreaView>
    </BackgroundView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 20 },
  scroll: { paddingTop: 16, paddingBottom: 32 },
  pressed: { opacity: 0.78 },
  eyebrow: {
    color: Colors.gold,
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: '500',
  },
  subEyebrow: {
    color: Colors.textMuted,
    fontSize: 12,
    letterSpacing: 1,
  },
  northCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceDeep,
    borderRadius: 12,
    overflow: 'hidden',
    paddingRight: 14,
  },
  northAccent: {
    width: 2,
    alignSelf: 'stretch',
    backgroundColor: Colors.gold,
  },
  northBody: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  northRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  northIcon: { color: Colors.gold, fontSize: 14 },
  northLabel: {
    color: Colors.gold,
    fontSize: 10,
    letterSpacing: 2.5,
  },
  northText: {
    color: Colors.textPrimary,
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: 0.3,
  },
  northTextMuted: {
    color: Colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: 0.3,
  },
  chev: {
    color: Colors.textMuted,
    fontSize: 22,
    paddingLeft: 8,
  },
  ruleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceDeep,
    borderRadius: 10,
    padding: 14,
    gap: 12,
  },
  ruleAnchor: { fontSize: 18 },
  ruleBody: { flex: 1 },
  ruleTitle: { color: Colors.textPrimary, fontSize: 13, letterSpacing: 0.5 },
  ruleMeta: { color: Colors.textMuted, fontSize: 11, marginTop: 3, letterSpacing: 0.5 },
  sectionLabel: {
    color: Colors.textDim,
    fontSize: 10,
    letterSpacing: 2.5,
  },
  chartCard: {
    backgroundColor: Colors.surfaceDeep,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  chartEmpty: {
    minHeight: CHART_H,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  chartEmptyIcon: { color: Colors.gold, fontSize: 22, opacity: 0.6 },
  chartEmptyText: {
    color: Colors.textMuted,
    fontSize: 13,
    letterSpacing: 1,
    textAlign: 'center',
  },
  chartEmptySub: {
    color: Colors.textDim,
    fontSize: 11,
    letterSpacing: 1,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 8,
    gap: 10,
    rowGap: 6,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendText: { color: Colors.textMuted, fontSize: 10, letterSpacing: 0.5 },
  sessionEmpty: {
    backgroundColor: Colors.surfaceDeep,
    borderRadius: 12,
    paddingVertical: 28,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  sessionEmptyText: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  sessionStart: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 0.5,
    borderColor: Colors.starlight,
  },
  sessionStartText: {
    color: Colors.starlight,
    fontSize: 12,
    letterSpacing: 1,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceDeep,
    borderRadius: 9,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderLeftWidth: 2,
    marginBottom: 8,
    gap: 10,
  },
  sessionEmoji: { fontSize: 20 },
  sessionTextWrap: { flex: 1 },
  sessionLabel: { color: Colors.textSecondary, fontSize: 12, letterSpacing: 0.5 },
  sessionPreview: {
    color: Colors.textDim,
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  sessionDate: {
    color: Colors.textDim,
    fontSize: 11,
    letterSpacing: 1,
    marginLeft: 'auto',
  },
});
