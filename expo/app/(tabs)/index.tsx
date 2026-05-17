// expo/app/index.tsx
import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../hooks/useAuth';

export default function RootIndex() {
  const { user, loading } = useAuth();

  // 認証状態を読み込み中は、真っ黒画面を防ぐためにスピナーを表示
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C8A040" />
      </View>
    );
  }

  // ログインしていればメインのタブ（アストロラーベ）へ、していなければログイン画面へ
  if (user) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/auth/login" />;
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#050A18',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
