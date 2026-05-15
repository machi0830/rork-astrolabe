import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BackgroundView } from '@/components/BackgroundView';
import { PrimaryButton, SecondaryButton } from '@/components/Buttons';
import Typo from '@/components/Typography';
import Colors from '@/constants/colors';
import { useNorthStar, type Situation } from '@/hooks/useNorthStar';

const mockGenerateNorthStar = (): Promise<string> =>
  new Promise((resolve) =>
    setTimeout(
      () =>
        resolve(
          '不安に揺れながらも、相手を信じることを選び、自分の気持ちを穏やかに伝えられる航海士'
        ),
      2000
    )
  );

export default function NorthStarGenerate() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string; situation?: string; mode?: string }>();
  const { data, saveNorthStar } = useNorthStar();

  const isEdit = params.mode === 'edit' && !!data;
  const [generating, setGenerating] = useState<boolean>(!isEdit);
  const [text, setText] = useState<string>(isEdit && data ? data.statement : '');
  const [editing, setEditing] = useState<boolean>(isEdit);
  const [saving, setSaving] = useState<boolean>(false);

  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!generating) return;
    const loop = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [generating, rotate]);

  useEffect(() => {
    if (isEdit) return;
    let cancelled = false;
    (async () => {
      const result = await mockGenerateNorthStar();
      if (!cancelled) {
        setText(result);
        setGenerating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isEdit]);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    const name = (params.name as string) ?? data?.name ?? null;
    const situation = ((params.situation as string) || data?.situation || null) as Situation | null;
    await saveNorthStar({ statement: text.trim(), name, situation });
    setSaving(false);
    router.replace('/(tabs)/northstar');
  };

  return (
    <BackgroundView screenKey="NorthStarScreen" style={styles.flex}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Typo variant="eyebrow">YOUR  NORTH  STAR</Typo>
            <View style={{ height: 12 }} />
            <Typo variant="title">
              {generating ? '観測中...' : isEdit ? '北極星を編集' : '北極星が灯りました'}
            </Typo>

            <View style={{ height: 40 }} />

            {generating ? (
              <View style={styles.loadingBlock}>
                <Animated.Text
                  style={[styles.spinner, { transform: [{ rotate: spin }] }]}
                >
                  ✦
                </Animated.Text>
                <View style={{ height: 18 }} />
                <Typo style={styles.loadingText}>北極星を観測中...</Typo>
              </View>
            ) : (
              <View style={styles.goldCard}>
                <Typo style={styles.starGlyph}>✦</Typo>
                <View style={{ height: 12 }} />
                {editing ? (
                  <TextInput
                    value={text}
                    onChangeText={setText}
                    style={styles.editor}
                    multiline
                    placeholder="あなたの北極星を言葉にしてみる…"
                    placeholderTextColor={Colors.textMuted}
                    selectionColor={Colors.starlight}
                    autoFocus
                  />
                ) : (
                  <Typo style={styles.statement}>{text}</Typo>
                )}
              </View>
            )}
          </ScrollView>

          {!generating ? (
            <View style={styles.footer}>
              <PrimaryButton
                label={editing ? '保存する' : 'これが私の北極星'}
                onPress={editing ? handleSave : handleSave}
                loading={saving}
                disabled={!text.trim()}
              />
              {!editing ? (
                <SecondaryButton label="編集する" onPress={() => setEditing(true)} />
              ) : null}
            </View>
          ) : null}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </BackgroundView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 24 },
  scroll: { paddingVertical: 24, flexGrow: 1 },
  loadingBlock: { alignItems: 'center', paddingVertical: 60 },
  spinner: { fontSize: 28, color: Colors.gold },
  loadingText: {
    fontSize: 13,
    color: Colors.textMuted,
    letterSpacing: 1,
    textAlign: 'center',
  },
  goldCard: {
    backgroundColor: Colors.surfaceDeep,
    borderWidth: 0.5,
    borderColor: Colors.gold,
    borderRadius: 12,
    padding: 20,
  },
  starGlyph: {
    fontSize: 24,
    color: Colors.gold,
    textAlign: 'center',
  },
  statement: {
    fontSize: 14,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
  },
  editor: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 24,
    textAlign: 'center',
    minHeight: 96,
    padding: 0,
  },
  footer: { paddingBottom: 16, gap: 12 },
});
