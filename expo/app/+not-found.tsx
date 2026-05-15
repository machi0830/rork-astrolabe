import React from 'react';
import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import ScreenContainer from '@/components/ScreenContainer';
import Typo from '@/components/Typography';
import Colors from '@/constants/colors';

export default function NotFoundScreen() {
  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Typo variant="eyebrow">404</Typo>
        <View style={{ height: 14 }} />
        <Typo variant="title">この星は見つかりません。</Typo>
        <View style={{ height: 24 }} />
        <Link href="/" style={styles.link}>
          <Typo variant="body" style={{ color: Colors.starlight }}>
            観測へ戻る
          </Typo>
        </Link>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  link: { paddingVertical: 12 },
});
