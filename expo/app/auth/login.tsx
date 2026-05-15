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
import { Eye, EyeOff } from 'lucide-react-native';
import { BackgroundView } from '@/components/BackgroundView';
import { PrimaryButton } from '@/components/Buttons';
import Colors from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!email.trim() || !password) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error: e } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (e) {
      setError('メールアドレスまたはパスワードが違います');
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
              <Text style={styles.title}>おかえりなさい</Text>
              <Text style={styles.subtitle}>航海の続きから始めます</Text>

              <View style={{ height: 28 }} />

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

              <Text style={styles.label}>パスワード</Text>
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

              {error ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={{ height: 24 }} />

              <PrimaryButton
                label="航海を続ける"
                onPress={onSubmit}
                loading={submitting}
              />

              <View style={{ height: 20 }} />

              <Pressable onPress={() => router.push('/auth/signup')} hitSlop={10}>
                <Text style={styles.link}>はじめての方はこちら →</Text>
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
  scroll: { flexGrow: 1, paddingVertical: 32 },
  top: { alignItems: 'center', paddingTop: 12 },
  logo: {
    fontSize: 12,
    letterSpacing: 3,
    color: Colors.textDim,
    fontWeight: '500',
  },
  star: { color: Colors.gold, fontSize: 22, marginTop: 12 },
  center: { flex: 1, justifyContent: 'center', paddingTop: 32 },
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
