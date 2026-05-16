import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Switch,
  Alert,
  Linking,
  Modal,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/colors';
import { supabase } from '@/lib/supabase';

const PLAN_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  trial:    { label: '14日トライアル', color: '#60A5FA', bg: '#0A1428' },
  standard: { label: 'Standard',      color: '#289A78', bg: '#0A2018' },
  longGame: { label: 'Long Game ✦',   color: '#C8A040', bg: '#1A1000' },
  expired:  { label: '期限切れ',      color: '#804040', bg: '#100808' },
};

export default function SettingsScreen() {
  const [profile, setProfile] = useState<{
    name: string | null;
    plan: string | null;
    trial_started_at: string | null;
  } | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('21:00');

  const [disclaimerVisible, setDisclaimerVisible] = useState(false);

  useEffect(() => {
    fetchProfile();
    loadNotificationSettings();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) return;
      setEmail(authData.user.email ?? null);

      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('name, plan, trial_started_at')
        .eq('id', authData.user.id)
        .single();

      if (profileData) setProfile(profileData);
    } catch (e) {
      console.error('fetchProfile error', e);
    }
  };

  const loadNotificationSettings = async () => {
    const enabled = await AsyncStorage.getItem('reminderEnabled');
    const time = await AsyncStorage.getItem('reminderTime');
    setReminderEnabled(enabled === 'true');
    if (time) setReminderTime(time);
  };

  const getDaysLeft = () => {
    if (!profile?.trial_started_at) return null;
    const start = new Date(profile.trial_started_at);
    const elapsed = Math.floor((Date.now() - start.getTime()) / 86400000);
    return Math.max(0, 14 - elapsed);
  };

  const getJoinDate = () => {
    if (!profile?.trial_started_at) return null;
    const d = new Date(profile.trial_started_at);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  const planInfo = profile?.plan ? PLAN_LABELS[profile.plan] ?? PLAN_LABELS.expired : null;
  const daysLeft = getDaysLeft();
  const initials = (profile?.name ?? email ?? 'G').charAt(0).toUpperCase();

  const handleUpdateName = async () => {
    if (!newName.trim()) return;
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return;
    await supabase.from('user_profiles').update({ name: newName.trim() }).eq('id', authData.user.id);
    setProfile(prev => prev ? { ...prev, name: newName.trim() } : prev);
    setExpandedSection(null);
    setNewName('');
  };

  const handleUpdateEmail = async () => {
    if (!newEmail.trim()) return;
    await supabase.auth.updateUser({ email: newEmail.trim() });
    Alert.alert('確認メールを送信しました', '新しいメールアドレスに確認メールを送りました。');
    setExpandedSection(null);
    setNewEmail('');
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      Alert.alert('エラー', 'パスワードが一致しません。');
      return;
    }
    await supabase.auth.updateUser({ password: newPassword });
    Alert.alert('完了', 'パスワードを変更しました。');
    setExpandedSection(null);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleToggleReminder = async (value: boolean) => {
    setReminderEnabled(value);
    await AsyncStorage.setItem('reminderEnabled', value ? 'true' : 'false');
  };

  const handleLogout = () => {
    Alert.alert(
      'ログアウト',
      'ログアウトするとローカルデータも削除されます。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'ログアウト',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            await AsyncStorage.clear();
            router.replace('/auth');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'アカウント削除',
      'この操作は取り消せません。すべてのデータが削除されます。',
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: '削除', style: 'destructive', onPress: () => {
          Alert.alert('準備中', 'アカウント削除機能は準備中です。');
        }},
      ]
    );
  };

  const PRIVACY_URL = '';
  const TERMS_URL = '';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SETTINGS</Text>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={22} color={Colors.textDim} />
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        <Text style={styles.sectionLabel}>PROFILE</Text>
        <View style={styles.card}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{profile?.name ?? 'ゲスト航海士'}</Text>
              <Text style={styles.userEmail}>{email ?? ''}</Text>
              {planInfo && (
                <View style={[styles.planBadge, { backgroundColor: planInfo.bg }]}>
                  <Text style={[styles.planLabel, { color: planInfo.color }]}>{planInfo.label}</Text>
                </View>
              )}
            </View>
          </View>

          {profile?.plan === 'trial' && daysLeft !== null && (
            <Text style={[styles.trialInfo, daysLeft <= 3 && { color: Colors.warning }]}>
              トライアル残り {daysLeft} 日
            </Text>
          )}

          {getJoinDate() && (
            <Text style={styles.joinDate}>入会日：{getJoinDate()}</Text>
          )}

          {profile?.plan !== 'longGame' && (
            <Pressable style={styles.upgradeButton}>
              <Text style={styles.upgradeText}>プランをアップグレード →</Text>
            </Pressable>
          )}
        </View>

        <Text style={styles.sectionLabel}>ACCOUNT</Text>

        <View style={styles.listItem}>
          <Pressable
            style={styles.listRow}
            onPress={() => setExpandedSection(expandedSection === 'name' ? null : 'name')}
          >
            <Text style={styles.listLabel}>ユーザー名変更</Text>
            <Text style={styles.listChevron}>›</Text>
          </Pressable>
          {expandedSection === 'name' && (
            <View style={styles.editArea}>
              <TextInput
                style={styles.input}
                placeholder={profile?.name ?? 'ゲスト航海士'}
                placeholderTextColor={Colors.textDim}
                value={newName}
                onChangeText={setNewName}
              />
              <Pressable style={styles.saveButton} onPress={handleUpdateName}>
                <Text style={styles.saveText}>保存</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.listItem}>
          <Pressable
            style={styles.listRow}
            onPress={() => setExpandedSection(expandedSection === 'email' ? null : 'email')}
          >
            <Text style={styles.listLabel}>メールアドレス変更</Text>
            <Text style={styles.listChevron}>›</Text>
          </Pressable>
          {expandedSection === 'email' && (
            <View style={styles.editArea}>
              <TextInput
                style={styles.input}
                placeholder={email ?? 'メールアドレス'}
                placeholderTextColor={Colors.textDim}
                value={newEmail}
                onChangeText={setNewEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Pressable style={styles.saveButton} onPress={handleUpdateEmail}>
                <Text style={styles.saveText}>確認メールを送信</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.listItem}>
          <Pressable
            style={styles.listRow}
            onPress={() => setExpandedSection(expandedSection === 'password' ? null : 'password')}
          >
            <Text style={styles.listLabel}>パスワード変更</Text>
            <Text style={styles.listChevron}>›</Text>
          </Pressable>
          {expandedSection === 'password' && (
            <View style={styles.editArea}>
              <TextInput
                style={styles.input}
                placeholder="現在のパスワード"
                placeholderTextColor={Colors.textDim}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
              />
              <TextInput
                style={[styles.input, { marginTop: 8 }]}
                placeholder="新しいパスワード"
                placeholderTextColor={Colors.textDim}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
              <TextInput
                style={[styles.input, { marginTop: 8 }]}
                placeholder="新しいパスワード（確認）"
                placeholderTextColor={Colors.textDim}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
              <Pressable style={styles.saveButton} onPress={handleUpdatePassword}>
                <Text style={styles.saveText}>変更する</Text>
              </Pressable>
            </View>
          )}
        </View>

        <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
        <View style={[styles.listItem, { marginBottom: 0 }]}>
          <View style={[styles.listRow, { paddingVertical: 14 }]}>
            <Text style={styles.listLabel}>日誌リマインダー</Text>
            <Switch
              value={reminderEnabled}
              onValueChange={handleToggleReminder}
              trackColor={{ false: Colors.border, true: Colors.starlight }}
              thumbColor="#fff"
            />
          </View>
          {reminderEnabled && (
            <Text style={styles.reminderInfo}>毎日 {reminderTime} に通知（UI表示のみ）</Text>
          )}
        </View>

        <Text style={styles.sectionLabel}>APP INFO</Text>

        <Pressable
          style={styles.listItem}
          onPress={() => PRIVACY_URL ? Linking.openURL(PRIVACY_URL) : Alert.alert('準備中', 'URLは準備中です。')}
        >
          <View style={styles.listRow}>
            <Text style={[styles.listLabel, !PRIVACY_URL && { color: Colors.textDim }]}>
              プライバシーポリシー{!PRIVACY_URL ? '（準備中）' : ''}
            </Text>
            <Text style={styles.listChevron}>›</Text>
          </View>
        </Pressable>

        <Pressable
          style={styles.listItem}
          onPress={() => TERMS_URL ? Linking.openURL(TERMS_URL) : Alert.alert('準備中', 'URLは準備中です。')}
        >
          <View style={styles.listRow}>
            <Text style={[styles.listLabel, !TERMS_URL && { color: Colors.textDim }]}>
              利用規約{!TERMS_URL ? '（準備中）' : ''}
            </Text>
            <Text style={styles.listChevron}>›</Text>
          </View>
        </Pressable>

        <Pressable style={styles.listItem} onPress={() => setDisclaimerVisible(true)}>
          <View style={styles.listRow}>
            <Text style={styles.listLabel}>免責事項</Text>
            <Text style={styles.listChevron}>›</Text>
          </View>
        </Pressable>

        <View style={styles.listItem}>
          <View style={styles.listRow}>
            <Text style={styles.listLabel}>バージョン情報</Text>
            <Text style={styles.listChevron}>
              {Constants.expoConfig?.version ?? '1.0.0'}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>ACCOUNT ACTIONS</Text>

        <Pressable style={styles.listItem} onPress={handleLogout}>
          <View style={styles.listRow}>
            <Text style={[styles.listLabel, { color: Colors.warning }]}>ログアウト</Text>
          </View>
        </Pressable>

        <View style={{ height: 24 }} />

        <Pressable onPress={handleDeleteAccount}>
          <Text style={styles.deleteText}>アカウントを削除する</Text>
        </Pressable>

        <View style={{ height: 60 }} />
      </ScrollView>

      <Modal visible={disclaimerVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>免責事項</Text>
            <Text style={styles.modalBody}>
              本アプリは臨床的な心理診断ではありません。{'\n'}
              学術研究の知見を参照した内省ツールです。{'\n'}
              医療・カウンセリングの代替となるものではありません。
            </Text>
            <Pressable style={styles.modalClose} onPress={() => setDisclaimerVisible(false)}>
              <Text style={styles.modalCloseText}>閉じる</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#06091C' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 11,
    letterSpacing: 3,
    color: '#1A2848',
    fontWeight: '600',
  },
  closeButton: { position: 'absolute', right: 16, top: 20, padding: 4 },
  scroll: { flex: 1, paddingHorizontal: 16 },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: 2,
    color: '#1A2848',
    marginTop: 28,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#080D20',
    borderRadius: 12,
    padding: 16,
    marginBottom: 4,
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#60A5FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 22, fontWeight: '700', color: '#050A18' },
  userName: { fontSize: 16, color: '#9AAAC8', fontWeight: '600' },
  userEmail: { fontSize: 12, color: '#1A2848', marginTop: 2 },
  planBadge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 6,
  },
  planLabel: { fontSize: 11, fontWeight: '600' },
  trialInfo: { marginTop: 12, fontSize: 13, color: '#9AAAC8' },
  joinDate: { marginTop: 6, fontSize: 12, color: '#1A2848' },
  upgradeButton: { marginTop: 12, alignSelf: 'flex-start' },
  upgradeText: { fontSize: 13, color: '#60A5FA' },
  listItem: {
    backgroundColor: '#080D20',
    borderRadius: 9,
    marginBottom: 6,
    overflow: 'hidden',
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  listLabel: { fontSize: 14, color: '#9AAAC8' },
  listChevron: { fontSize: 18, color: '#1A2848' },
  editArea: { paddingHorizontal: 14, paddingBottom: 14 },
  input: {
    backgroundColor: '#050A18',
    borderRadius: 7,
    padding: 10,
    color: '#9AAAC8',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#0C1428',
  },
  saveButton: {
    marginTop: 10,
    backgroundColor: '#60A5FA',
    borderRadius: 7,
    padding: 10,
    alignItems: 'center',
  },
  saveText: { color: '#050A18', fontWeight: '700', fontSize: 14 },
  reminderInfo: { paddingHorizontal: 14, paddingBottom: 12, fontSize: 12, color: '#1A2848' },
  deleteText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#1A2848',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#06091C',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: { fontSize: 16, color: '#9AAAC8', fontWeight: '700', marginBottom: 16 },
  modalBody: { fontSize: 14, color: '#6070A0', lineHeight: 24 },
  modalClose: {
    marginTop: 24,
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingVertical: 10,
    backgroundColor: '#080D20',
    borderRadius: 8,
  },
  modalCloseText: { color: '#9AAAC8', fontSize: 14 },
});
