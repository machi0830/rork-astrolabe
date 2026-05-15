import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Check, Eye, EyeOff } from 'lucide-react-native';
import { BackgroundView } from '@/components/BackgroundView';
import { PrimaryButton } from '@/components/Buttons';
import Colors from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';

export default function SignupScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);
  const [agreeDisclaimer, setAgreeDisclaimer] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    agreeTerms &&
    agreeDisclaimer &&
    email.trim().length > 0 &&
    password.length >= 8 &&
    password === confirmPassword;

  const onSubmit = async () => {
    setError(null);
    if (password.length < 8) {
      setError('パスワードは8文字以上で入力してください');
      return;
    }
    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }
    setSubmitting(true);
    const { error: e } = await signUp(email.trim(), password);
    setSubmitting(false);
    if (e) {
      setError(e);
      return;
    }
    router.replace('/(tabs)/observation');
  };

  return (
    <BackgroundView screenKey="OB1Screen" style={styles.flex}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.top}>
              <Text style={styles.logo}>ASTROLABE</Text>
              <Text style={styles.star}>✦</Text>
            </View>

            <View style={styles.center}>
              <Text style={styles.title}>航海を始める</Text>
              <Text style={styles.subtitle}>新しいアカウントを作成します</Text>

              <View style={{ height: 24 }} />

              <Text style={styles.label}>メールアドレス</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="navigator@example.com"
                placeholderTextColor={Colors.textDim}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                style={styles.input}
              />

              <View style={{ height: 14 }} />

              <Text style={styles.label}>パスワード（8文字以上）</Text>
              <View style={styles.passwordWrap}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.textDim}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  style={[styles.input, styles.passwordInput]}
                />
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={10}
                  style={styles.eyeBtn}
                >
                  {showPassword ? (
                    <EyeOff color={Colors.textMuted} size={18} />
                  ) : (
                    <Eye color={Colors.textMuted} size={18} />
                  )}
                </Pressable>
              </View>

              <View style={{ height: 14 }} />

              <Text style={styles.label}>パスワード（確認）</Text>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="••••••••"
                placeholderTextColor={Colors.textDim}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                style={styles.input}
              />

              <View style={{ height: 20 }} />

              <Pressable
                style={styles.checkRow}
                onPress={() => setAgreeTerms((v) => !v)}
                hitSlop={6}
              >
                <View style={[styles.checkbox, agreeTerms && styles.checkboxOn]}>
                  {agreeTerms && <Check size={12} color={Colors.background} />}
                </View>
                <Text style={styles.checkLabel}>利用規約に同意します</Text>
              </Pressable>

              <View style={{ height: 10 }} />

              <Pressable
                style={styles.disclaimerBox}
                onPress={() => setAgreeDisclaimer((v) => !v)}
              >
                <View style={[styles.checkbox, agreeDisclaimer && styles.checkboxOn]}>
                  {agreeDisclaimer && <Check size={12} color={Colors.background} />}
                </View>
                <Text style={styles.disclaimerText}>
                  本アプリは臨床的な心理診断ではありません。{'\n'}
                  自己理解のための内省ツールとして利用します。
                </Text>
              </Pressable>

              {error ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={{ height: 24 }} />

              <PrimaryButton
                label="登録する"
                onPress={onSubmit}
                disabled={!canSubmit}
                loading={submitting}
              />

              <View style={{ height: 20 }} />

              <Pressable onPress={() => router.replace('/auth/login')} hitSlop={10}>
                <Text style={styles.link}>すでにアカウントをお持ちの方 →</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </BackgroundView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 24 },
  scroll: { flexGrow: 1, paddingVertical: 24 },
  top: { alignItems: 'center', paddingTop: 4 },
  logo: {
    fontSize: 12,
    letterSpacing: 3,
    color: Colors.textDim,
    fontWeight: '500',
  },
  star: { color: Colors.gold, fontSize: 20, marginTop: 10 },
  center: { flex: 1, justifyContent: 'center', paddingTop: 20 },
  title: {
    fontSize: 20,
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 1,
  },
  label: {
    fontSize: 11,
    color: Colors.textDim,
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.surfaceDeep,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: Colors.textPrimary,
    fontSize: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  passwordWrap: { position: 'relative' },
  passwordInput: { paddingRight: 40 },
  eyeBtn: {
    position: 'absolute',
    right: 10,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.borderActive,
    backgroundColor: Colors.surfaceDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  checkLabel: { color: Colors.textSecondary, fontSize: 13 },
  disclaimerBox: {
    backgroundColor: '#100808',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    borderLeftWidth: 2,
    borderLeftColor: '#804040',
  },
  disclaimerText: {
    flex: 1,
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 18,
  },
  errorBanner: {
    backgroundColor: '#100808',
    borderRadius: 8,
    padding: 10,
    marginTop: 14,
    borderLeftWidth: 2,
    borderLeftColor: '#804040',
  },
  errorText: { color: '#E05060', fontSize: 12, lineHeight: 18 },
  link: {
    color: Colors.textDim,
    fontSize: 12,
    textAlign: 'center',
    letterSpacing: 1,
  },
});
