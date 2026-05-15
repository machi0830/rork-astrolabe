import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { BackgroundView } from '@/components/BackgroundView';
import Colors from '@/constants/colors';
import {
  buildRecentDots,
  getStreakBadge,
  MAX_SLOTS,
  useIfThen,
  type IfThenRule,
} from '@/hooks/useIfThen';

const LONG_PRESS_MS = 800;

export default function IfThenScreen() {
  const router = useRouter();
  const { activeRules, graduatedRules, checkToday, graduate } = useIfThen();

  const slots = useMemo<(IfThenRule | null)[]>(() => {
    const arr: (IfThenRule | null)[] = [...activeRules];
    while (arr.length < MAX_SLOTS) arr.push(null);
    return arr.slice(0, MAX_SLOTS);
  }, [activeRules]);

  const handleAdd = useCallback(() => {
    router.push('/(tabs)/journal');
  }, [router]);

  const handleGraduate = useCallback(
    (rule: IfThenRule) => {
      Alert.alert(
        'この習慣は身についた。卒業しますか？',
        `「${rule.thenAction}」\n\n卒業すると航路に刻まれ、新しいスロットが空きます。`,
        [
          { text: 'キャンセル', style: 'cancel' },
          {
            text: '卒業する',
            style: 'default',
            onPress: () => {
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
                  () => {}
                );
              }
              graduate(rule.id).catch((e) => console.log('[ifthen] graduate err', e));
            },
          },
        ]
      );
    },
    [graduate]
  );

  return (
    <BackgroundView screenKey="IfThenScreen" style={styles.flex}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text style={styles.back}>‹ 航跡へ</Text>
          </Pressable>

          <View style={{ height: 16 }} />

          <Text style={styles.eyebrow}>IF / THEN  ·  HABITS</Text>
          <View style={{ height: 14 }} />
          <Text style={styles.title}>5つの航海ルール</Text>
          <View style={{ height: 10 }} />
          <Text style={styles.subtitle}>
            一度に育てる習慣は、最大5つまで。{'\n'}
            ひとつを「卒業」させると、次の余白が開きます。
          </Text>

          <View style={{ height: 6 }} />
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              {activeRules.length} / {MAX_SLOTS} slots
            </Text>
            <Text style={styles.metaTextDim}>
              graduated · {graduatedRules.length}
            </Text>
          </View>

          <View style={{ height: 22 }} />

          {slots.map((rule, idx) => (
            <View key={rule?.id ?? `empty-${idx}`} style={{ marginBottom: 12 }}>
              {rule ? (
                <ActiveSlot
                  rule={rule}
                  index={idx}
                  onCheck={() => checkToday(rule.id)}
                  onGraduate={() => handleGraduate(rule)}
                />
              ) : (
                <EmptySlot index={idx} onPress={handleAdd} />
              )}
            </View>
          ))}

          {graduatedRules.length > 0 ? (
            <>
              <View style={{ height: 28 }} />
              <View style={styles.archiveHeader}>
                <View style={styles.archiveLine} />
                <Text style={styles.archiveTitle}>航路に刻まれた習慣</Text>
                <View style={styles.archiveLine} />
              </View>
              <View style={{ height: 16 }} />
              {graduatedRules.map((r) => (
                <GraduatedItem key={r.id} rule={r} />
              ))}
            </>
          ) : null}

          <View style={{ height: 48 }} />
        </ScrollView>
      </SafeAreaView>
    </BackgroundView>
  );
}

function EmptySlot({ index, onPress }: { index: number; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.empty, pressed ? { opacity: 0.75 } : null]}
      testID={`ifthen-slot-empty-${index}`}
    >
      <Text style={styles.emptyIndex}>0{index + 1}</Text>
      <Text style={styles.emptyLabel}>＋ 新しいルールを登録</Text>
      <Text style={styles.emptyHint}>日誌で深掘りして提案を受け取る</Text>
    </Pressable>
  );
}

function ActiveSlot({
  rule,
  index,
  onCheck,
  onGraduate,
}: {
  rule: IfThenRule;
  index: number;
  onCheck: () => Promise<boolean>;
  onGraduate: () => void;
}) {
  const badge = getStreakBadge(rule.streakCount);
  const dots = useMemo(() => buildRecentDots(rule.checkDates, 8), [rule.checkDates]);
  const today = new Date().toISOString().split('T')[0];
  const checkedToday = rule.lastCheckedAt === today;
  const canGraduate = rule.streakCount >= 30;

  const ripple = useRef(new Animated.Value(0)).current;
  const press = useRef(new Animated.Value(0)).current;
  const [busy, setBusy] = useState<boolean>(false);

  const triggerRipple = useCallback(() => {
    ripple.setValue(0);
    Animated.timing(ripple, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [ripple]);

  const onLongPress = useCallback(async () => {
    if (busy || checkedToday) return;
    setBusy(true);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    triggerRipple();
    try {
      await onCheck();
    } finally {
      setBusy(false);
    }
  }, [busy, checkedToday, onCheck, triggerRipple]);

  const onPressIn = useCallback(() => {
    if (checkedToday) return;
    Animated.timing(press, {
      toValue: 1,
      duration: LONG_PRESS_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [press, checkedToday]);

  const onPressOut = useCallback(() => {
    Animated.timing(press, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [press]);

  const rippleScale = ripple.interpolate({ inputRange: [0, 1], outputRange: [0.4, 2.6] });
  const rippleOpacity = ripple.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });
  const pressWidth = press.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View
      style={[styles.slot, { borderLeftColor: rule.color }]}
      testID={`ifthen-slot-${index}`}
    >
      <View style={styles.slotHeader}>
        <Text style={styles.slotIndex}>0{index + 1}</Text>
        <View style={[styles.badge, { backgroundColor: badge.bg, borderColor: badge.color + '55' }]}>
          <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
        </View>
      </View>

      <View style={{ height: 12 }} />
      <Text style={styles.ifLabel}>If：{rule.ifTrigger}</Text>
      <View style={{ height: 6 }} />
      <Text style={[styles.thenLabel, { color: rule.color }]}>Then：{rule.thenAction}</Text>

      <View style={{ height: 14 }} />

      <View style={styles.dotsRow}>
        {dots.map((on, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              on
                ? { backgroundColor: badge.color, borderColor: badge.color }
                : { backgroundColor: 'transparent', borderColor: Colors.borderActive },
            ]}
          />
        ))}
        <Text style={styles.streakText}>{rule.streakCount} 日連続</Text>
      </View>

      <View style={{ height: 14 }} />

      <View style={styles.checkWrap}>
        <Pressable
          onLongPress={onLongPress}
          delayLongPress={LONG_PRESS_MS}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          disabled={checkedToday}
          style={({ pressed }) => [
            styles.checkBtn,
            { borderColor: rule.color + (checkedToday ? '66' : 'AA') },
            checkedToday ? { backgroundColor: rule.color + '18' } : null,
            pressed && !checkedToday ? { opacity: 0.92 } : null,
          ]}
          testID={`ifthen-check-${index}`}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              styles.pressFill,
              { backgroundColor: rule.color + '22', width: pressWidth },
            ]}
          />
          <Animated.View
            pointerEvents="none"
            style={[
              styles.ripple,
              {
                backgroundColor: rule.color,
                transform: [{ scale: rippleScale }],
                opacity: rippleOpacity,
              },
            ]}
          />
          <Text style={[styles.checkLabel, { color: checkedToday ? rule.color : Colors.textPrimary }]}>
            {checkedToday ? '✓ 今日の実践を記録しました' : '長押しで「今日実践できた」'}
          </Text>
        </Pressable>
      </View>

      {canGraduate ? (
        <>
          <View style={{ height: 10 }} />
          <Pressable
            onPress={onGraduate}
            style={({ pressed }) => [
              styles.graduateBtn,
              pressed ? { opacity: 0.8 } : null,
            ]}
            testID={`ifthen-graduate-${index}`}
          >
            <Text style={styles.graduateLabel}>✦ 卒業する</Text>
          </Pressable>
        </>
      ) : null}
    </View>
  );
}

function GraduatedItem({ rule }: { rule: IfThenRule }) {
  const date = rule.graduateAt ? new Date(rule.graduateAt) : null;
  const dateLabel = date
    ? `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(
        date.getDate()
      ).padStart(2, '0')}`
    : '';
  return (
    <View style={[styles.graduated, { borderLeftColor: rule.color + '88' }]}>
      <View style={styles.graduatedHead}>
        <Text style={styles.graduatedStar}>✦</Text>
        <Text style={styles.graduatedMeta}>
          {dateLabel}  ·  {rule.streakCount}日連続
        </Text>
      </View>
      <View style={{ height: 6 }} />
      <Text style={styles.graduatedThen}>{rule.thenAction}</Text>
      <Text style={styles.graduatedIf}>If：{rule.ifTrigger}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 20 },
  scroll: { paddingVertical: 16 },
  back: { color: Colors.textMuted, fontSize: 13 },
  eyebrow: {
    color: Colors.gold,
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: '500',
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 22,
    letterSpacing: 1,
    fontWeight: '300',
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metaText: { color: Colors.textSecondary, fontSize: 11, letterSpacing: 1.5 },
  metaTextDim: { color: Colors.textDim, fontSize: 11, letterSpacing: 1.5 },

  slot: {
    backgroundColor: Colors.surfaceDeep,
    borderRadius: 14,
    borderLeftWidth: 2,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  slotHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  slotIndex: {
    color: Colors.textDim,
    fontSize: 11,
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  badge: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { fontSize: 10, letterSpacing: 1.5, fontWeight: '500' },

  ifLabel: { fontSize: 11, color: Colors.textDim, letterSpacing: 0.5 },
  thenLabel: { fontSize: 14, lineHeight: 22, letterSpacing: 0.3 },

  dotsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
  },
  streakText: {
    marginLeft: 'auto',
    color: Colors.textMuted,
    fontSize: 11,
    letterSpacing: 1,
  },

  checkWrap: { width: '100%' },
  checkBtn: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: Colors.background,
  },
  pressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  ripple: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: 'center',
  },
  checkLabel: {
    fontSize: 13,
    letterSpacing: 1,
    fontWeight: '500',
  },

  graduateBtn: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.gold,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    backgroundColor: '#1A1000',
  },
  graduateLabel: {
    color: Colors.gold,
    fontSize: 13,
    letterSpacing: 2,
    fontWeight: '500',
  },

  empty: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderStyle: 'dashed',
    borderColor: Colors.borderActive,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(8,13,32,0.4)',
  },
  emptyIndex: {
    color: Colors.textDim,
    fontSize: 11,
    letterSpacing: 2,
  },
  emptyLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    letterSpacing: 1,
    marginTop: 8,
  },
  emptyHint: {
    color: Colors.textDim,
    fontSize: 11,
    letterSpacing: 0.5,
    marginTop: 6,
  },

  archiveHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  archiveLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: Colors.borderActive },
  archiveTitle: {
    color: Colors.textDim,
    fontSize: 11,
    letterSpacing: 3,
  },
  graduated: {
    borderLeftWidth: 1,
    paddingLeft: 12,
    paddingVertical: 10,
    marginBottom: 10,
    opacity: 0.75,
  },
  graduatedHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  graduatedStar: { color: Colors.gold, fontSize: 12 },
  graduatedMeta: { color: Colors.textDim, fontSize: 11, letterSpacing: 1 },
  graduatedThen: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20 },
  graduatedIf: { color: Colors.textDim, fontSize: 11, marginTop: 4 },
});
