import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle, Line, Rect, Text as SvgText } from 'react-native-svg';
import { BackgroundView } from '@/components/BackgroundView';
import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/Buttons';
import Typo from '@/components/Typography';
import Colors from '@/constants/colors';
import type {
  AttachmentType,
  BigFiveKey,
  EQKey,
  HorsemanKey,
  Scores50,
} from '@/lib/scoring50';

const RESULT_TMP_KEY = 'pro_diagnostic_last_result';

const TYPE_LABELS: Record<AttachmentType, { label: string; color: string; desc: string }> = {
  secure: { label: '安定型', color: '#289A78', desc: '自分の感情を認識しパートナーとの絆に安定感を持てます。' },
  anxious: { label: '不安型', color: '#4A8ED4', desc: '愛情を強く求め、拒絶を恐れる傾向があります。' },
  avoidant: { label: '回避型', color: '#7058C0', desc: '自立を重視し、感情表現が少ない傾向があります。' },
  fearful: { label: '恐怖回避型', color: '#A84468', desc: '親密さを求めながらも傷つくことを恐れます。' },
};

const BIG_FIVE_LABELS: Record<BigFiveKey, string> = {
  N: '情緒安定性',
  A: '協調性',
  C: '誠実性',
  O: '開放性',
  E: '外向性',
};

const EQ_LABELS: Record<EQKey, string> = {
  selfAware: '自己認識',
  otherAware: '他者認識',
  useEmotion: '感情活用',
  regulate: '感情制御',
};

const HORSEMAN_LABELS: Record<HorsemanKey, string> = {
  criticism: '批判',
  contempt: '侮蔑',
  defensiveness: '防衛',
  stonewalling: '逃避',
};

export default function ProDiagnosticResult() {
  const router = useRouter();
  const [scores, setScores] = useState<Scores50 | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(RESULT_TMP_KEY);
        if (raw) setScores(JSON.parse(raw) as Scores50);
      } catch (e) {
        console.log('[proresult] load failed', e);
      }
    })();
  }, []);

  if (!scores) {
    return (
      <BackgroundView screenKey="DiagnosticHomeScreen" style={styles.flex}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.loading}>
            <Typo variant="muted">結果を読み込んでいます…</Typo>
          </View>
        </SafeAreaView>
      </BackgroundView>
    );
  }

  const typeInfo = TYPE_LABELS[scores.attachment.attachmentType];

  return (
    <BackgroundView screenKey="DiagnosticHomeScreen" style={styles.flex}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Typo variant="eyebrow">PRECISE OBSERVATION</Typo>
          <View style={{ height: 10 }} />
          <Typo variant="title">精密観測の結果</Typo>
          <View style={{ height: 6 }} />
          <Typo variant="body">
            50の問いから、5つの視点をより細かく観測しました。
          </Typo>

          <View style={{ height: 22 }} />

          {/* 愛着スタイル 4象限 */}
          <Card>
            <Typo variant="eyebrow" style={{ color: Colors.attachment }}>ATTACHMENT</Typo>
            <View style={{ height: 6 }} />
            <Typo variant="heading">愛着スタイル</Typo>
            <View style={{ height: 14 }} />
            <View style={styles.center}>
              <AttachmentQuadrant
                anxiety={scores.attachment.anxietyScore}
                avoidance={scores.attachment.avoidanceScore}
                color={typeInfo.color}
              />
            </View>
            <View style={{ height: 14 }} />
            <View style={[styles.typeBadge, { borderColor: typeInfo.color }]}>
              <Typo style={[styles.typeBadgeText, { color: typeInfo.color }]}>
                {typeInfo.label}
              </Typo>
            </View>
            <View style={{ height: 10 }} />
            <Typo style={styles.metaDesc}>{typeInfo.desc}</Typo>
            <View style={{ height: 12 }} />
            <View style={styles.subRow}>
              <SubBar label="不安傾向" value={scores.attachment.anxietyScore} color={Colors.attachment} />
              <SubBar label="回避傾向" value={scores.attachment.avoidanceScore} color={Colors.attachment} />
            </View>
            <View style={{ height: 12 }} />
            <Typo style={styles.researchNote}>
              ※ Brennan, Clark & Shaver (1998) ECR-R を参照した内省項目
            </Typo>
          </Card>

          <View style={{ height: 18 }} />

          {/* ビッグファイブ */}
          <Card>
            <Typo variant="eyebrow" style={{ color: Colors.bigfive }}>BIG FIVE</Typo>
            <View style={{ height: 6 }} />
            <Typo variant="heading">5つの傾向</Typo>
            <View style={{ height: 14 }} />
            {(Object.keys(BIG_FIVE_LABELS) as BigFiveKey[]).map((k) => (
              <FactorBar
                key={k}
                label={BIG_FIVE_LABELS[k]}
                value={scores.bigfive[k]}
                color={Colors.bigfive}
                highlight={k === scores.bigfive.lowest}
              />
            ))}
            <View style={{ height: 8 }} />
            <Typo style={styles.growthHint}>
              ✦ 「{BIG_FIVE_LABELS[scores.bigfive.lowest]}」が今期の成長ポイント
            </Typo>
            <View style={{ height: 6 }} />
            <Typo style={styles.researchNote}>
              ※ 神経症傾向（N）と協調性（A）は恋愛満足度と最も強く相関する（Malouff et al., 2010）
            </Typo>
          </Card>

          <View style={{ height: 18 }} />

          {/* アサーション */}
          <Card>
            <Typo variant="eyebrow" style={{ color: Colors.assertion }}>ASSERTION</Typo>
            <View style={{ height: 6 }} />
            <Typo variant="heading">アサーション</Typo>
            <View style={{ height: 14 }} />
            <FactorBar label="自己表現" value={scores.assertion.expression} color={Colors.assertion} />
            <FactorBar label="境界線" value={scores.assertion.boundary} color={Colors.assertion} />
            <FactorBar label="対立場面" value={scores.assertion.conflict} color={Colors.assertion} />
            <View style={{ height: 6 }} />
            <Typo style={styles.researchNote}>
              ※ 自己表現・境界線・対立場面の3軸でアサーティブネスを観測
            </Typo>
          </Card>

          <View style={{ height: 18 }} />

          {/* EQ */}
          <Card>
            <Typo variant="eyebrow" style={{ color: Colors.eq }}>EMOTIONAL INTELLIGENCE</Typo>
            <View style={{ height: 6 }} />
            <Typo variant="heading">感情知性 EQ</Typo>
            <View style={{ height: 14 }} />
            {(Object.keys(EQ_LABELS) as EQKey[]).map((k) => (
              <FactorBar
                key={k}
                label={EQ_LABELS[k]}
                value={scores.eq[k]}
                color={Colors.eq}
                highlight={k === scores.eq.lowest}
              />
            ))}
            <View style={{ height: 8 }} />
            <Typo style={styles.growthHint}>
              ✦ 「{EQ_LABELS[scores.eq.lowest]}」が伸びしろです
            </Typo>
            <View style={{ height: 6 }} />
            <Typo style={styles.researchNote}>
              ※ Mayer & Salovey (1997) の4枝モデルを参照
            </Typo>
          </Card>

          <View style={{ height: 18 }} />

          {/* 関係構築力（四騎士＋修復） */}
          <Card>
            <Typo variant="eyebrow" style={{ color: Colors.relation }}>RELATIONSHIP</Typo>
            <View style={{ height: 6 }} />
            <Typo variant="heading">関係構築力</Typo>
            <View style={{ height: 6 }} />
            <Typo style={styles.metaDesc}>
              数値が高いほど、関係を壊すパターンを取りにくい傾向です。
            </Typo>
            <View style={{ height: 14 }} />
            {(Object.keys(HORSEMAN_LABELS) as HorsemanKey[]).map((k) => (
              <FactorBar
                key={k}
                label={HORSEMAN_LABELS[k]}
                value={scores.relation[k]}
                color={Colors.relation}
                highlight={k === scores.relation.dominantHorseman}
              />
            ))}
            <View style={{ height: 10 }} />
            <View style={styles.repairRow}>
              <Typo style={styles.repairLabel}>修復力</Typo>
              <View style={styles.repairBarTrack}>
                <View
                  style={[
                    styles.repairBarFill,
                    { width: `${scores.relation.repair}%`, backgroundColor: Colors.gold },
                  ]}
                />
              </View>
              <Typo style={[styles.repairNum, { color: Colors.gold }]}>
                {scores.relation.repair}
              </Typo>
            </View>
            <View style={{ height: 12 }} />
            <Typo style={styles.growthHint}>
              ✦ 意識したいパターン：{HORSEMAN_LABELS[scores.relation.dominantHorseman]}
            </Typo>
            <View style={{ height: 6 }} />
            <Typo style={styles.researchNote}>
              ※ 侮蔑は関係の持続性に最も影響するパターン（Gottman, 1994）
            </Typo>
          </Card>

          <View style={{ height: 22 }} />

          {/* 免責 */}
          <View style={styles.disclaimer}>
            <Typo style={styles.disclaimerText}>
              本診断は学術研究の知見を参照した内省ツールです。{'\n'}
              臨床的な心理診断ではありません。
            </Typo>
          </View>

          <View style={{ height: 22 }} />

          <PrimaryButton
            label="北極星を生成する"
            onPress={() => router.push('/(tabs)/northstar/name')}
          />
          <View style={{ height: 10 }} />
          <PrimaryButton
            label="観測ホームに戻る"
            onPress={() => router.replace('/(tabs)/observation')}
            style={styles.secondaryAction}
          />
        </ScrollView>
      </SafeAreaView>
    </BackgroundView>
  );
}

function AttachmentQuadrant({
  anxiety,
  avoidance,
  color,
}: {
  anxiety: number;
  avoidance: number;
  color: string;
}) {
  const size = 160;
  const pad = 18;
  const inner = size - pad * 2;
  const cx = pad + (avoidance / 100) * inner;
  const cy = pad + ((100 - anxiety) / 100) * inner;
  const half = pad + inner / 2;
  return (
    <Svg width={size} height={size}>
      <Rect x={pad} y={pad} width={inner / 2} height={inner / 2} fill="#0A1428" opacity={0.5} />
      <Rect x={half} y={pad} width={inner / 2} height={inner / 2} fill="#1A1224" opacity={0.5} />
      <Rect x={pad} y={half} width={inner / 2} height={inner / 2} fill="#0A1E18" opacity={0.5} />
      <Rect x={half} y={half} width={inner / 2} height={inner / 2} fill="#1E0A14" opacity={0.5} />
      <Line x1={half} y1={pad} x2={half} y2={size - pad} stroke={Colors.border} strokeWidth={0.5} />
      <Line x1={pad} y1={half} x2={size - pad} y2={half} stroke={Colors.border} strokeWidth={0.5} />
      <SvgText x={pad} y={pad - 4} fontSize="8" fill={Colors.textDim}>不安↑</SvgText>
      <SvgText x={size - pad - 8} y={size - pad + 10} fontSize="8" fill={Colors.textDim}>回避→</SvgText>
      <Circle cx={cx} cy={cy} r={10} fill={color} opacity={0.15} />
      <Circle cx={cx} cy={cy} r={5} fill={color} />
      <Circle cx={cx} cy={cy} r={5} fill="none" stroke={color} strokeWidth={1} opacity={0.6} />
    </Svg>
  );
}

function FactorBar({
  label,
  value,
  color,
  highlight,
}: {
  label: string;
  value: number;
  color: string;
  highlight?: boolean;
}) {
  const fillColor = highlight ? Colors.gold : color;
  return (
    <View style={styles.factorRow}>
      <Typo style={[styles.factorLabel, highlight && { color: Colors.gold }]}>
        {label}
      </Typo>
      <View style={styles.factorTrack}>
        <View
          style={[
            styles.factorFill,
            { width: `${value}%`, backgroundColor: fillColor },
          ]}
        />
      </View>
      <Typo style={[styles.factorNum, { color: fillColor }]}>{value}</Typo>
    </View>
  );
}

function SubBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.subBarWrap}>
      <Typo style={styles.subBarLabel}>{label}</Typo>
      <View style={styles.subBarTrack}>
        <View
          style={[
            styles.subBarFill,
            { width: `${value}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Typo style={[styles.subBarNum, { color }]}>{value}</Typo>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 22 },
  scroll: { paddingVertical: 22, paddingBottom: 48 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center' },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: Colors.surfaceDeep,
  },
  typeBadgeText: { fontSize: 12, letterSpacing: 1, fontWeight: '500' },
  metaDesc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 20 },
  subRow: { gap: 8 },
  subBarWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  subBarLabel: { width: 72, fontSize: 11, color: Colors.textMuted },
  subBarTrack: {
    flex: 1,
    height: 2,
    borderRadius: 1,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  subBarFill: { height: '100%', borderRadius: 1 },
  subBarNum: { width: 32, textAlign: 'right', fontSize: 11 },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  factorLabel: { width: 80, fontSize: 12, color: Colors.textSecondary, letterSpacing: 0.5 },
  factorTrack: {
    flex: 1,
    height: 2,
    borderRadius: 1,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  factorFill: { height: '100%', borderRadius: 1 },
  factorNum: { width: 30, textAlign: 'right', fontSize: 12, fontWeight: '500' },
  growthHint: {
    fontSize: 11,
    color: Colors.gold,
    letterSpacing: 1,
  },
  researchNote: {
    fontSize: 10,
    color: Colors.textDim,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  repairRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  repairLabel: { width: 80, fontSize: 12, color: Colors.gold, letterSpacing: 0.5 },
  repairBarTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  repairBarFill: { height: '100%', borderRadius: 2 },
  repairNum: { width: 30, textAlign: 'right', fontSize: 12, fontWeight: '500' },
  disclaimer: {
    backgroundColor: '#100808',
    borderLeftWidth: 2,
    borderLeftColor: '#804040',
    borderRadius: 7,
    padding: 12,
  },
  disclaimerText: {
    fontSize: 11,
    color: '#7A3A3A',
    lineHeight: 18,
  },
  secondaryAction: {
    backgroundColor: Colors.surfaceDeep,
  },
});
