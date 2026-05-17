// expo/app/(tabs)/index.tsx
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Dimensions, ScrollView, Easing } from 'react-native';
import Svg, { Circle, Path, G } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

// 既存の画面コンポーネントをインポート（パスは既存プロジェクトに合わせて調整してください）
// ※もしコンポーネント化されていない場合は、各ファイルのデフォルトエクスポートを呼び出します
import ObservationScreen from './observation/index';
import NorthStarScreen from './northstar/index';
import JournalHomeScreen from './journal/index';
import WakeViewScreen from './wake/index';

type TabMode = 'observe' | 'northstar' | 'journal' | 'wake' | 'hub';

export default function AstrolabeHubScreen() {
  const [currentMode, setCurrentMode] = useState<TabMode>('hub');
  
  // アニメーション用の値
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const contentFadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // アストロラーベ計器の無限回転アニメーション
  useEffect(() => {
    const startRotation = () => {
      rotateAnim.setValue(0);
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 40000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    };
    startRotation();
  }, [rotateAnim]);

  // モード切り替え時の演出
  const handleModeChange = (mode: TabMode) => {
    Animated.parallel([
      Animated.timing(contentFadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: mode === 'hub' ? 1 : 0.65, duration: 300, useNativeDriver: true })
    ]).start(() => {
      setCurrentMode(mode);
      Animated.timing(contentFadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    });
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* 🌌 背景：神秘的な星空のパララックス演出 */}
      <View style={StyleSheet.absoluteFill}>
        {[...Array(40)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.star,
              {
                top: Math.random() * height,
                left: Math.random() * width,
                opacity: Math.random() * 0.7 + 0.2,
                transform: [{ scale: Math.random() * 1.5 + 0.5 }],
              },
            ]}
          />
        ))}
      </View>

      <SafeAreaView style={styles.safeArea}>
        {currentMode === 'hub' ? (
          /* 🔭 メインの没入ハブ状態 */
          <View style={styles.hubContainer}>
            <View style={styles.header}>
              <Text style={styles.brandTitle}>ASTROLABE</Text>
              <Text style={styles.brandSubtitle}>あなたの航海図</Text>
            </View>

            {/* 中央のアストロラーベ計器 */}
            <Animated.View style={[styles.instrumentWrapper, { transform: [{ rotate: spin }, { scale: scaleAnim }] }]}>
              <Svg width={280} height={280} viewBox="0 0 280 280">
                {/* 外周リング */}
                <Circle cx="140" cy="140" r="130" stroke="#C8A040" strokeWidth="1" fill="none" opacity="0.4" />
                <Circle cx="140" cy="140" r="125" stroke="#C8A040" strokeWidth="0.5" fill="none" strokeDasharray="2, 4" opacity="0.3" />
                {/* 内周軌道 */}
                <Circle cx="140" cy="140" r="80" stroke="#4A8ED4" strokeWidth="1" fill="none" opacity="0.2" />
                {/* 羅針盤の目盛り */}
                <G opacity="0.4">
                  <Path d="M140 10 L140 20 M140 260 L140 270 M10 140 L20 140 M260 140 L270 140" stroke="#C8A040" strokeWidth="1.5" />
                </G>
                {/* 神秘的なコネクションライン */}
                <Path d="M60 140 Q140 60 220 140 T60 140" stroke="#7058C0" strokeWidth="0.5" fill="none" opacity="0.3" />
              </Svg>
            </Animated.View>

            {/* 🧭 円周型ナビゲーション（四方タップ） */}
            <View style={styles.navOverlay}>
              <TouchableOpacity style={[styles.navButton, styles.navTop]} onPress={() => handleModeChange('observe')}>
                <Text style={styles.navIcon}>◎</Text>
                <Text style={styles.navLabel}>観測</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.navButton, styles.navRight]} onPress={() => handleModeChange('northstar')}>
                <Text style={styles.navIcon}>✦</Text>
                <Text style={styles.navLabel}>北極星</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.navButton, styles.navBottom]} onPress={() => handleModeChange('journal')}>
                <Text style={styles.navIcon}>◫</Text>
                <Text style={styles.navLabel}>日誌</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.navButton, styles.navLeft]} onPress={() => handleModeChange('wake')}>
                <Text style={styles.navIcon}>〜</Text>
                <Text style={styles.navLabel}>航跡</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.footerHint}>計器をタップして探索する</Text>
          </View>
        ) : (
          /* 🪐 各モードのコンテンツ展開状態（既存画面をそのまま呼び出し） */
          <Animated.View style={[styles.contentContainer, { opacity: contentFadeAnim }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {currentMode === 'observe' && <ObservationScreen />}
              {currentMode === 'northstar' && <NorthStarScreen />}
              {currentMode === 'journal' && <JournalHomeScreen />}
              {currentMode === 'wake' && <WakeViewScreen />}
            </ScrollView>

            {/* ‹ 戻るミニナビゲーション */}
            <TouchableOpacity style={styles.backButton} onPress={() => handleModeChange('hub')}>
              <Text style={styles.backButtonText}>⚓ 計器へ戻る</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050A18' },
  safeArea: { flex: 1 },
  star: { position: 'absolute', width: 2, height: 2, backgroundColor: '#FFF', borderRadius: 1 },
  hubContainer: { flex: 1, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 40 },
  header: { alignItems: 'center', marginTop: 20 },
  brandTitle: { fontSize: 24, letterSpacing: 8, color: '#FFF', fontWeight: '300' },
  brandSubtitle: { fontSize: 12, letterSpacing: 3, color: '#60A5FA', marginTop: 8, opacity: 0.8 },
  instrumentWrapper: { position: 'absolute', top: height / 2 - 140, left: width / 2 - 140, width: 280, height: 280, justifyContent: 'center', alignItems: 'center' },
  navOverlay: { position: 'absolute', width: width, height: height * 0.5, top: height * 0.22 },
  navButton: { position: 'absolute', alignItems: 'center', justifyContent: 'center', padding: 15 },
  navTop: { top: 0, left: width / 2 - 40, width: 80 },
  navRight: { right: width * 0.08, top: height * 0.2 },
  navBottom: { bottom: 0, left: width / 2 - 40, width: 80 },
  navLeft: { left: width * 0.08, top: height * 0.2 },
  navIcon: { fontSize: 22, color: '#C8A040', marginBottom: 4 },
  navLabel: { fontSize: 12, color: '#A0AEC0', letterSpacing: 2 },
  footerHint: { fontSize: 11, color: '#4A5568', letterSpacing: 2, marginBottom: 20 },
  contentContainer: { flex: 1, width: width },
  scrollContent: { paddingBottom: 100 },
  backButton: { position: 'absolute', bottom: 25, alignSelf: 'center', backgroundColor: 'rgba(10, 20, 40, 0.9)', borderWidth: 0.5, borderColor: '#C8A040', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20 },
  backButtonText: { color: '#C8A040', fontSize: 12, letterSpacing: 2 },
});
