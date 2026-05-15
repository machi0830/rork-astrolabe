/**
 * BackgroundView
 *
 * 画像・動画・グラデーションを統一的に扱う背景コンポーネント。
 * assets.ts の値が null の場合は自動的に LinearGradient にフォールバックする。
 *
 * 使い方:
 *   <BackgroundView screenKey="NorthStarScreen" style={styles.container}>
 *     {children}
 *   </BackgroundView>
 */

import React from "react";
import { StyleSheet, View, ImageBackground, ViewStyle, StyleProp } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenAssets, ScreenKey } from "@/constants/assets";

// v2以降: import { Video } from 'expo-av'

interface BackgroundViewProps {
  screenKey: ScreenKey;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

const GRADIENT_PRESETS: Record<ScreenKey, readonly [string, string, string]> = {
  OB1Screen: ["#050A18", "#0A1428", "#050A18"],
  OB3Screen: ["#050A18", "#0A1428", "#050A18"],
  DiagnosticHomeScreen: ["#050A18", "#060B1E", "#050A18"],
  NorthStarScreen: ["#050A18", "#08122A", "#050A18"],
  JournalHomeScreen: ["#050A18", "#061018", "#050A18"],
  WakeViewScreen: ["#050A18", "#0A1428", "#050A18"],
};

export const BackgroundView: React.FC<BackgroundViewProps> = ({
  screenKey,
  style,
  children,
}) => {
  const assets = ScreenAssets[screenKey];

  // ── フェーズ3（v2以降）: 動画背景 ───────────────────────
  // if (assets.video) {
  //   return (
  //     <View style={[styles.container, style]}>
  //       <Video
  //         source={assets.video}
  //         style={StyleSheet.absoluteFill}
  //         shouldPlay
  //         isLooping
  //         isMuted
  //         resizeMode="cover"
  //       />
  //       <View style={[StyleSheet.absoluteFill, styles.overlay]} />
  //       {children}
  //     </View>
  //   );
  // }

  // ── フェーズ2: 静止画背景（Freepik画像あり）─────────────
  if (assets.bg) {
    return (
      <ImageBackground
        source={assets.bg}
        style={[styles.container, style]}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        {children}
      </ImageBackground>
    );
  }

  // ── フェーズ1（現在）: グラデーション代替 ────────────────
  return (
    <LinearGradient
      colors={GRADIENT_PRESETS[screenKey]}
      style={[styles.container, style]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 10, 24, 0.45)",
  },
});

export default BackgroundView;
