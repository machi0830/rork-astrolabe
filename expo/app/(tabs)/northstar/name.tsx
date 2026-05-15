import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { BackgroundView } from '@/components/BackgroundView';
import { PrimaryButton } from '@/components/Buttons';
import Typo from '@/components/Typography';
import Colors from '@/constants/colors';
import { SITUATIONS, type Situation } from '@/hooks/useNorthStar';

export default function NameInput() {
  const router = useRouter();
  const [name, setName] = useState<string>('');
  const [situation, setSituation] = useState<Situation | null>(null);

  const goGenerate = (withInputs: boolean) => {
    const params: Record<string, string> = {};
    if (withInputs) {
      if (name.trim()) params.name = name.trim();
      if (situation) params.situation = situation;
    }
    router.push({ pathname: '/(tabs)/northstar/generate', params });
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
            <Typo variant="eyebrow">SETUP  /  CALL  SIGN</Typo>
            <View style={{ height: 12 }} />
            <Typo variant="title">あなたのこと</Typo>
            <View style={{ height: 10 }} />
            <Typo style={styles.desc}>
              入力すると、あなただけの北極星が生成されます（スキップ可）
            </Typo>

            <View style={{ height: 28 }} />

            <Typo style={styles.fieldLabel}>呼び名（ニックネームでOK）</Typo>
            <View style={{ height: 8 }} />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="航海士"
              placeholderTextColor={Colors.textMuted}
              style={styles.input}
              selectionColor={Colors.starlight}
              autoCorrect={false}
              maxLength={24}
            />

            <View style={{ height: 24 }} />

            <Typo style={styles.fieldLabel}>今の恋愛状況</Typo>
            <View style={{ height: 8 }} />
            <View style={styles.radioGroup}>
              {SITUATIONS.map((s) => {
                const selected = situation === s.id;
                return (
                  <Pressable
                    key={s.id}
                    onPress={() => setSituation(s.id)}
                    style={[styles.radio, selected ? styles.radioSelected : null]}
                  >
                    <View style={[styles.dot, selected ? styles.dotSelected : null]} />
                    <Typo style={styles.radioLabel}>{s.label}</Typo>
                  </Pressable>
                );
              })}
            </View>

            <View style={{ height: 32 }} />
          </ScrollView>

          <View style={styles.footer}>
            <PrimaryButton label="北極星を生成する" onPress={() => goGenerate(true)} />
            <Pressable onPress={() => goGenerate(false)} hitSlop={12}>
              <Typo style={styles.skip}>入力せずに生成する</Typo>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </BackgroundView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 24 },
  scroll: { paddingVertical: 24 },
  desc: { fontSize: 12, color: Colors.textMuted, lineHeight: 22 },
  fieldLabel: { fontSize: 11, color: Colors.textDim, letterSpacing: 2 },
  input: {
    backgroundColor: Colors.surfaceDeep,
    borderRadius: 8,
    padding: 12,
    color: Colors.textPrimary,
    fontSize: 15,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  radioGroup: { gap: 8 },
  radio: {
    backgroundColor: Colors.surfaceDeep,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  radioSelected: { borderColor: Colors.starlight },
  radioLabel: { fontSize: 14, color: Colors.textPrimary, letterSpacing: 0.5 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors.textDim,
  },
  dotSelected: { backgroundColor: Colors.starlight, borderColor: Colors.starlight },
  footer: { paddingBottom: 16, gap: 14 },
  skip: {
    fontSize: 12,
    color: Colors.textDim,
    textAlign: 'center',
    letterSpacing: 1,
  },
});
