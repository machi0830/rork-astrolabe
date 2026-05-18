// expo/app/(tabs)/index.tsx
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Dimensions, ScrollView, Easing } from 'react-native';
import Svg, { Circle, Path, G } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

// 既存画面のインポート
import ObservationScreen from './observation';
import NorthStarScreen from './northstar';
import JournalHomeScreen from './journal';
import WakeViewScreen from './wake';

type TabMode = 'observe' | 'northstar' | 'journal' | 'wake' | 'hub';

export default function AstrolabeHubScreen() {
  const [currentMode, setCurrentMode] = useState<TabMode>('hub');
  
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const contentFadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

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
      
      {/* 🌌 深い宇宙と星空の背景 */}
      <View style={StyleSheet.absoluteFill}>
        {[...Array(40)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.star,
              {
                top: Math.random() * (height * 0.7),
                left: Math.random() * width,
                opacity: Math.random() * 0.7 + 0.3,
              },
            ]}
          />
        ))}
      </View>

      <SafeAreaView style={styles.safeArea}>
        {currentMode === 'hub' ? (
          <View style={styles.hubContainer}>
            <View style={styles.header}>
              <Text style={styles.brandTitle}>ASTROLABE</Text>
              <Text style={styles.brandSubtitle}>感情に翻弄されるのでなく、冷静に海図を読み、自律して航海する</Text>
            </View>

            {/* 🧭 中央のアストロラーベゴールド計器（描画をReact Native用に最適化） */}
            <View style={styles.instrumentOuterContainer}>
              <Animated.View style={[styles.instrumentWrapper, { transform: [{ rotate: spin }, { scale: scaleAnim }] }]}>
                <Svg width={260} height={260} viewBox="0 0 280 280">
                  {/* 外周のゴールドリング */}
                  <Circle cx="140" cy="140" r="130" stroke="#C8A040" strokeWidth="2" fill="none" />
                  <Circle cx="140" cy="140" r="120" stroke="#C8A040" strokeWidth="0.5" fill="none" strokeDasharray="4, 4" />
                  <Circle cx="140" cy="140" r="80" stroke="#4A8ED4" strokeWidth="1" fill="none" />
                  
                  {/* 目盛り線 */}
                  <Path d="M140 10 L140 25 M140 255 L140 270 M10 140 L25 140 M255 140 L270 140" stroke="#C8A040" strokeWidth="2" />
                  <Path d="M49 49 L60 60 M231 49 L220 60 M49 231 L60 220 M231 231 L220 220" stroke="#C8A040" strokeWidth="1" />
                  
                  {/* 内側の幾何学模様 */}
                  <Path d="M140 60 A80 80 0 0 1 220 140 A80 80 0 0 1 140 220 A80 80 0 0 1 60 140 A80 80 0 0 1 140 60" stroke="#7058C0" strokeWidth="0.75" fill="none" />
                  <Circle cx="140" cy="140" r="6" fill="#C8A040" />
                </Svg>
              </Animated.View>
            </View>

            {/* 四方ナビゲーションボタン */}
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
          <Animated.View style={[styles.contentContainer, { opacity: contentFadeAnim }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {currentMode === 'observe' && <ObservationScreen />}
              {currentMode === 'northstar' && <NorthStarScreen />}
              {currentMode === 'journal' && <JournalHomeScreen />}
              {currentMode === 'wake' && <WakeViewScreen />}
            </ScrollView>

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
  container: { flex: 1, backgroundColor: '#030712' },
  safeArea: { flex: 1 },
  star: { position: 'absolute', width: 2, height: 2, backgroundColor: '#FFF', borderRadius: 1 },
  hubContainer: { flex: 1, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 30 },
  header: { alignItems: 'center', marginTop: 15, paddingHorizontal: 30 },
  brandTitle: { fontSize: 24, letterSpacing: 8, color: '#FFF', fontWeight: '300' },
  brandSubtitle: { fontSize: 11, color: '#9CA3AF', marginTop: 12, textAlign: 'center', lineHeight: 18, letterSpacing: 1 },
  instrumentOuterContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 280 },
  instrumentWrapper: { width: 260, height: 260, justifyContent: 'center', alignItems: 'center' },
  navOverlay: { position: 'absolute', width: width, height: 320, top: '32%' },
  navButton: { position: 'absolute', alignItems: 'center', justifyContent: 'center', width: 70, height: 60 },
  navTop: { top: 0, left: width / 2 - 35 },
  navRight: { right: width * 0.08, top: 120 },
  navBottom: { bottom: 0, left: width / 2 - 35 },
  navLeft: { left: width * 0.08, top: 120 },
  navIcon: { fontSize: 20, color: '#C8A040', marginBottom: 2 },
  navLabel: { fontSize: 12, color: '#9CA3AF', letterSpacing: 2 },
  footerHint: { fontSize: 11, color: '#4B5563', letterSpacing: 2, marginBottom: 10 },
  contentContainer: { flex: 1, width: width },
  scrollContent: { paddingBottom: 100 },
  backButton: { position: 'absolute', bottom: 25, alignSelf: 'center', backgroundColor: 'rgba(17, 24, 39, 0.95)', borderWidth: 1, borderColor: '#C8A040', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20 },
  backButtonText: { color: '#C8A040', fontSize: 12, letterSpacing: 2 },
});
