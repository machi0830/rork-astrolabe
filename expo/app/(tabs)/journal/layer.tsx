import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BackgroundView } from '@/components/BackgroundView';
import Colors from '@/constants/colors';
import { GENRE_BY_ID, type GenreId } from '@/constants/genres';
import { JOURNAL_QUESTIONS, type LayerKey } from '@/constants/journalQuestions';

const LAYERS: LayerKey[] = ['L1', 'L2', 'L3', 'L4'];

export default function JournalLayer() {
  const router = useRouter();
  const params = useLocalSearchParams<{ genreId?: string }>();
  const genreId = (params.genreId as GenreId) || 'anxiety';
  const genre = GENRE_BY_ID[genreId] ?? GENRE_BY_ID.anxiety;

  const [layerIdx, setLayerIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, [layerIdx, fade]);

  const currentLayer = LAYERS[layerIdx];
  const currentQ = JOURNAL_QUESTIONS[genreId][currentLayer];

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const choice = currentQ.opts[idx];
    setTimeout(() => {
      const nextAnswers = [...answers, choice];
      if (layerIdx === 3) {
        router.replace({
          pathname: '/(tabs)/journal/insight',
          params: { genreId, answers: JSON.stringify(nextAnswers) },
        });
      } else {
        setAnswers(nextAnswers);
        setSelected(null);
        setLayerIdx(layerIdx + 1);
      }
    }, 400);
  };

  const handleBack = () => {
    if (layerIdx === 0) {
      router.back();
    } else {
      setSelected(null);
      setAnswers(answers.slice(0, -1));
      setLayerIdx(layerIdx - 1);
    }
  };

  return (
    <BackgroundView screenKey="JournalHomeScreen" style={styles.flex}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.topRow}>
          <Pressable onPress={handleBack} hitSlop={12} testID="layer-back">
            <Text style={styles.back}>‹ 戻る</Text>
          </Pressable>
          <Text style={[styles.genreLabel, { color: genre.color }]}>
            {genre.emoji}  {genre.label}
          </Text>
          <Text style={styles.counter}>{layerIdx + 1} / 4</Text>
        </View>

        <View style={styles.progress}>
          {LAYERS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.segment,
                { backgroundColor: i <= layerIdx ? genre.color : Colors.border },
              ]}
            />
          ))}
        </View>

        {answers.length > 0 ? (
          <View style={styles.breadcrumb}>
            <Text style={styles.crumbText} numberOfLines={2}>
              {genre.emoji} {genre.label}
              {answers.map((a) => `  ›  ${a}`).join('')}
            </Text>
          </View>
        ) : null}

        <Animated.View collapsable={undefined} style={[styles.content, { opacity: fade }]}>
          <Text style={styles.question}>{currentQ.q}</Text>

          <View style={{ height: 18 }} />

          {currentQ.opts.map((opt, idx) => {
            const isSelected = selected === idx;
            return (
              <Pressable
                key={idx}
                onPress={() => handleSelect(idx)}
                style={({ pressed }) => [
                  styles.opt,
                  isSelected ? { borderColor: genre.color, backgroundColor: genre.color + '14' } : null,
                  pressed && !isSelected ? styles.optPressed : null,
                ]}
                testID={`layer-opt-${idx}`}
              >
                <Text style={[styles.optText, isSelected ? { color: Colors.textPrimary } : null]}>
                  {opt}
                </Text>
              </Pressable>
            );
          })}
        </Animated.View>
      </SafeAreaView>
    </BackgroundView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  back: { color: Colors.textMuted, fontSize: 13 },
  genreLabel: { fontSize: 12, letterSpacing: 1, fontWeight: '500' },
  counter: { color: Colors.textDim, fontSize: 11, letterSpacing: 1 },
  progress: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 16,
  },
  segment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  breadcrumb: {
    backgroundColor: Colors.surfaceDeep,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 16,
  },
  crumbText: { fontSize: 11, color: Colors.textDim, lineHeight: 18 },
  content: { flex: 1, marginTop: 12 },
  question: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  opt: {
    backgroundColor: Colors.surfaceDeep,
    borderRadius: 9,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optPressed: { opacity: 0.7 },
  optText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
});
