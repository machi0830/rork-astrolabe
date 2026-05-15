import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { BackgroundView } from '@/components/BackgroundView';
import Colors from '@/constants/colors';
import { GENRES } from '@/constants/genres';

const formatToday = (): string => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}.${dd}`;
};

export default function JournalHome() {
  const router = useRouter();
  const today = formatToday();

  return (
    <BackgroundView screenKey="JournalHomeScreen" style={styles.flex}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>STARLIGHT JOURNAL</Text>
          <Text style={styles.date}>{today}</Text>
        </View>

        <Text style={styles.intro}>今日のできごとに近いものを選んでください</Text>

        <View style={styles.grid}>
          {GENRES.map((g) => (
            <Pressable
              key={g.id}
              onPress={() => router.push({ pathname: '/(tabs)/journal/layer', params: { genreId: g.id } })}
              style={({ pressed }) => [
                styles.card,
                { borderColor: g.color + '33' },
                pressed ? styles.cardPressed : null,
              ]}
              testID={`journal-genre-${g.id}`}
            >
              <Text style={styles.emoji}>{g.emoji}</Text>
              <Text style={styles.label}>{g.label}</Text>
              <View style={[styles.accent, { backgroundColor: g.color }]} />
            </Pressable>
          ))}
        </View>
      </SafeAreaView>
    </BackgroundView>
  );
}

const CARD_GAP = 12;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  eyebrow: {
    color: Colors.gold,
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: '500',
  },
  date: {
    color: Colors.textDim,
    fontSize: 11,
    letterSpacing: 2,
  },
  intro: {
    color: Colors.textMuted,
    fontSize: 12,
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  card: {
    width: `${(100 - 2) / 2}%`,
    aspectRatio: 1,
    backgroundColor: Colors.surfaceDeep,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardPressed: { opacity: 0.75 },
  emoji: { fontSize: 28, marginBottom: 10 },
  label: {
    fontSize: 13,
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
    opacity: 0.7,
  },
});
