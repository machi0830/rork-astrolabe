/**
 * NorthStarHaloLight
 *
 * Sits behind the instrument and shows the user's 「north star」:
 * a soft outer halo + mid glow + tiny pinpoint, gently breathing.
 * Mirrors the deepest z-layer in eng-app.jsx ("NORTH STAR LIGHT").
 *
 * Only renders when `visible` is true (parent should pass !!state.northStar).
 */

import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Easing } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { P } from '@/constants/theme';

export interface NorthStarHaloLightProps {
  visible: boolean;
  size?: number;
}

export default function NorthStarHaloLight({ visible, size = 240 }: NorthStarHaloLightProps) {
  const haloPulse = useRef(new Animated.Value(0)).current;
  const corePulse = useRef(new Animated.Value(0)).current;
  const twinkle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    const loop1 = Animated.loop(
      Animated.sequence([
        Animated.timing(haloPulse, { toValue: 1, duration: 3500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(haloPulse, { toValue: 0, duration: 3500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    const loop2 = Animated.loop(
      Animated.sequence([
        Animated.timing(corePulse, { toValue: 1, duration: 2250, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(corePulse, { toValue: 0, duration: 2250, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    const loop3 = Animated.loop(
      Animated.sequence([
        Animated.timing(twinkle, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(twinkle, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop1.start(); loop2.start(); loop3.start();
    return () => { loop1.stop(); loop2.stop(); loop3.stop(); };
  }, [visible, haloPulse, corePulse, twinkle]);

  if (!visible) return null;

  const haloScale = haloPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const haloOp = haloPulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.9] });
  const coreScale = corePulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });
  const coreOp = corePulse.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1] });
  const pinOp = twinkle.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });

  const outer = size;
  const mid = Math.round(size * 0.4);

  return (
    <View pointerEvents="none" style={[styles.fill, { alignItems: 'center', justifyContent: 'center' }]}>
      {/* Outer halo */}
      <Animated.View
        style={{
          position: 'absolute',
          width: outer, height: outer,
          opacity: haloOp,
          transform: [{ scale: haloScale }],
        }}
      >
        <Svg width={outer} height={outer}>
          <Defs>
            <RadialGradient id="ns-outer" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%">
              <Stop offset="0%" stopColor={P.gold} stopOpacity={0.10} />
              <Stop offset="25%" stopColor={P.gold} stopOpacity={0.04} />
              <Stop offset="60%" stopColor={P.gold} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={outer / 2} cy={outer / 2} r={outer / 2} fill="url(#ns-outer)" />
        </Svg>
      </Animated.View>

      {/* Mid glow */}
      <Animated.View
        style={{
          position: 'absolute',
          width: mid, height: mid,
          opacity: coreOp,
          transform: [{ scale: coreScale }],
        }}
      >
        <Svg width={mid} height={mid}>
          <Defs>
            <RadialGradient id="ns-mid" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%">
              <Stop offset="0%" stopColor={P.goldBright} stopOpacity={0.45} />
              <Stop offset="40%" stopColor={P.gold} stopOpacity={0.20} />
              <Stop offset="75%" stopColor={P.gold} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={mid / 2} cy={mid / 2} r={mid / 2} fill="url(#ns-mid)" />
        </Svg>
      </Animated.View>

      {/* Pinpoint star */}
      <Animated.View
        style={{
          position: 'absolute',
          width: 6, height: 6, borderRadius: 3,
          backgroundColor: P.goldBright,
          opacity: pinOp,
          shadowColor: P.gold,
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: 8,
          shadowOpacity: 0.9,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject },
});
