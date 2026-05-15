import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BackgroundView } from '@/components/BackgroundView';
import Colors from '@/constants/colors';
import { PrimaryButton } from '@/components/Buttons';
import { GENRE_BY_ID, type GenreId } from '@/constants/genres';
import { DOMAIN_BY_ID } from '@/constants/domains';
import { IF_THEN_TEMPLATES, INSIGHT_TEXT, type IfThenProposal } from '@/constants/ifThenTemplates';
import { supabase } from '@/lib/supabase';
import { useIfThen, MAX_SLOTS } from '@/hooks/useIfThen';
import { useJournalSessions } from '@/hooks/useJournalSessions';

export default function JournalInsight() {
  const router = useRouter();
  const params = useLocalSearchParams<{ genreId?: string; answers?: string }>();
  const genreId = (params.genreId as GenreId) || 'anxiety';
  const genre = GENRE_BY_ID[genreId] ?? GENRE_BY_ID.anxiety;
  const domain = DOMAIN_BY_ID[genre.primaryDomain];

  const answers: string[] = useMemo(() => {
    try {
      return params.answers ? (JSON.parse(params.answers as string) as string[]) : [];
    } catch {
      return [];
    }
  }, [params.answers]);

  const proposals = IF_THEN_TEMPLATES[genreId];
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [customMode, setCustomMode] = useState<boolean>(false);
  const [customIf, setCustomIf] = useState<string>('');
  const [customThen, setCustomThen] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const { addRule, activeRules } = useIfThen();
  const { addSession } = useJournalSessions();
  const slotsFull = activeRules.length >= MAX_SLOTS;

  React.useEffect(() => {
    const save = async () => {
      try {
        await addSession({ genre: genreId, layerAnswers: answers });
      } catch (e) {
        console.log('[journal_sessions] local save error', e);
      }
      try {
        if (!supabase) {
          console.log('[journal_sessions] mock save', { genreId, answers });
          return;
        }
        const { error } = await supabase.from('journal_sessions').insert({
          genre: genreId,
          layer_answers: answers,
        });
        if (error) console.log('[journal_sessions] insert error', error.message);
      } catch (e) {
        console.log('[journal_sessions] error', e);
      }
    };
    save();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genreId]);

  const handleRegister = async () => {
    setSaving(true);
    let rule: IfThenProposal;
    if (customMode) {
      const trimmedIf = customIf.trim();
      const trimmedThen = customThen.trim();
      if (!trimmedIf || !trimmedThen) {
        setSaving(false);
        return;
      }
      rule = {
        ifTrigger: trimmedIf,
        thenAction: trimmedThen,
        domain: genre.primaryDomain,
        color: genre.color,
      };
    } else {
      rule = proposals[selectedIdx];
    }

    try {
      const added = await addRule({
        ifTrigger: rule.ifTrigger,
        thenAction: rule.thenAction,
        domain: rule.domain,
        color: rule.color,
      });
      if (!added) {
        console.log('[ifthen_rules] slots full, cannot add');
      }
    } catch (e) {
      console.log('[ifthen_rules] error', e);
    } finally {
      setSaving(false);
      router.replace('/(tabs)/wake/ifthen');
    }
  };

  return (
    <BackgroundView screenKey="JournalHomeScreen" style={styles.flex}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Pressable onPress={() => router.replace('/(tabs)/journal')} hitSlop={12}>
            <Text style={styles.back}>‹ 日誌へ</Text>
          </Pressable>

          <View style={{ height: 16 }} />

          <Text style={styles.eyebrow}>INSIGHT</Text>
          <View style={{ height: 16 }} />

          <View style={[styles.badge, { borderColor: domain.color + '66' }]}>
            <View style={[styles.badgeDot, { backgroundColor: domain.color }]} />
            <Text style={[styles.badgeText, { color: domain.color }]}>{domain.label}</Text>
          </View>

          <View style={{ height: 18 }} />

          <Text style={styles.insight}>{INSIGHT_TEXT[genreId]}</Text>

          <View style={{ height: 28 }} />

          <Text style={styles.sectionLabel}>IF-THEN の提案</Text>
          <View style={{ height: 12 }} />

          {!customMode ? (
            proposals.map((p, idx) => {
              const isSelected = selectedIdx === idx;
              return (
                <Pressable
                  key={idx}
                  onPress={() => setSelectedIdx(idx)}
                  style={({ pressed }) => [
                    styles.proposal,
                    { borderLeftColor: p.color },
                    isSelected ? { backgroundColor: p.color + '14', borderColor: p.color + '55' } : null,
                    pressed ? { opacity: 0.8 } : null,
                  ]}
                  testID={`ifthen-proposal-${idx}`}
                >
                  <Text style={styles.ifLabel}>If：{p.ifTrigger}</Text>
                  <View style={{ height: 6 }} />
                  <Text style={[styles.thenLabel, { color: p.color }]}>Then：{p.thenAction}</Text>
                </Pressable>
              );
            })
          ) : (
            <View style={styles.customWrap}>
              <Text style={styles.customLabel}>If（きっかけ）</Text>
              <TextInput
                value={customIf}
                onChangeText={setCustomIf}
                placeholder="〜と感じたら"
                placeholderTextColor={Colors.textDim}
                style={styles.input}
              />
              <View style={{ height: 12 }} />
              <Text style={styles.customLabel}>Then（行動）</Text>
              <TextInput
                value={customThen}
                onChangeText={setCustomThen}
                placeholder="〜する"
                placeholderTextColor={Colors.textDim}
                style={styles.input}
                multiline
              />
            </View>
          )}

          <View style={{ height: 14 }} />

          <Pressable onPress={() => setCustomMode(!customMode)} hitSlop={8}>
            <Text style={styles.customToggle}>
              {customMode ? '↩ 提案から選ぶ' : '＋ 自分でルールを作る'}
            </Text>
          </Pressable>

          <View style={{ height: 28 }} />

          {slotsFull ? (
            <Text style={styles.slotsFullNote}>
              現在5つのルールを育てています。新しく登録するには、既存のどれかを卒業させてください。
            </Text>
          ) : null}

          <PrimaryButton
            label={saving ? '登録中...' : 'このルールを登録する'}
            onPress={handleRegister}
            loading={saving}
            disabled={slotsFull}
          />
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </BackgroundView>
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
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    gap: 6,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 11, letterSpacing: 1.5, fontWeight: '500' },
  insight: {
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 28,
    letterSpacing: 0.5,
  },
  sectionLabel: {
    color: Colors.textDim,
    fontSize: 11,
    letterSpacing: 2,
  },
  proposal: {
    backgroundColor: Colors.surfaceDeep,
    borderLeftWidth: 2,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 9,
    padding: 14,
    marginBottom: 10,
  },
  ifLabel: { fontSize: 11, color: Colors.textDim, letterSpacing: 0.5 },
  thenLabel: { fontSize: 13, lineHeight: 20, letterSpacing: 0.3 },
  customWrap: {
    backgroundColor: Colors.surfaceDeep,
    borderRadius: 9,
    padding: 14,
  },
  customLabel: { fontSize: 11, color: Colors.textDim, letterSpacing: 1, marginBottom: 6 },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.textPrimary,
    fontSize: 14,
    minHeight: 40,
  },
  customToggle: {
    color: Colors.starlight,
    fontSize: 12,
    letterSpacing: 1,
  },
  slotsFullNote: {
    color: Colors.warning,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
});
