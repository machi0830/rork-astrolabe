/**
 * AstrolabeInstrument
 *
 * Claude design "Astrolabe Engineering" 3-layer structure ported to React Native.
 *  - Layer 0 (back): Nebula drift (SVG RadialGradient + slow rotation)
 *  - Layer 1 (mid): Instrument plate (multi-concentric + cross + 8-direction notches)
 *  - Layer 2 (front): Brass outer ring (thick gradient + highlight arc)
 *
 *  ringAngle rotates the outer ring only to "focus" interaction.
 *  Lens scale pushes the inner core "deeper" via scale.
 */

import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Easing } from 'react-native';
import Svg, {
  Circle,
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Path,
  Line,
} from 'react-native-svg';

export interface AstrolabeInstrumentProps {
  size?: number;
  /** Outer ring target rotation angle (deg). */
  ringAngle?: number;
  /** Inner lens scale. 1=normal, 0.78=pushed back. */
  lensScale?: number;
  /** Inner lens blur strength. 0..1 */
  lensBlur?: number;
  children?: React.ReactNode;
}

const P = {
  bg: '#03050C',
  gold: '#D4A853',
  goldBright: '#F0C76A',
  goldDim: '#8A6A30',
  navy: '#1B3568',
  starlight: '#7EB8F0',
};

export const AstrolabeInstrument: React.FC<AstrolabeInstrumentProps> = ({
  size = 320,
  ringAngle = 0,
  lensScale = 1,
  children,
}) => {
  const nebulaAnim = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;
  const ringRotate = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(nebulaAnim, {
        toValue: 1,
        duration: 24000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(shineAnim, {
          toValue: 1,
          duration: 6000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(shineAnim, {
          toValue: 0,
          duration: 6000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [nebulaAnim, shineAnim]);

  useEffect(() => {
    Animated.timing(ringRotate, {
      toValue: ringAngle,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [ringAngle, ringRotate]);

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: lensScale,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [lensScale, scaleAnim]);

  const nebulaRotate = nebulaAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const shineRotate = shineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-2deg', '2deg'],
  });
  const ringRotateStr = ringRotate.interpolate({
    inputRange: [-360, 360],
    outputRange: ['-360deg', '360deg'],
  });

  const c = size / 2;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      {/* Layer 0: Nebula drift */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { transform: [{ rotate: nebulaRotate }] },
        ]}
      >
        <Svg width={size} height={size}>
          <Defs>
            <RadialGradient id="nebula" cx="50%" cy="50%" r="55%">
              <Stop offset="0%" stopColor={P.goldBright} stopOpacity={0.18} />
              <Stop offset="35%" stopColor={P.gold} stopOpacity={0.08} />
              <Stop offset="65%" stopColor={P.navy} stopOpacity={0.22} />
              <Stop offset="100%" stopColor={P.bg} stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="vignette" cx="50%" cy="50%" r="65%">
              <Stop offset="60%" stopColor="#000" stopOpacity={0} />
              <Stop offset="100%" stopColor="#000" stopOpacity={0.85} />
            </RadialGradient>
          </Defs>
          <Circle cx={c} cy={c} r={c * 0.95} fill="url(#nebula)" />
          <Circle cx={c} cy={c} r={c} fill="url(#vignette)" />
        </Svg>
      </Animated.View>

      {/* Layer 1: Instrument plate */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Svg width={size} height={size}>
          <Defs>
            <RadialGradient id="plate" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#0A1230" stopOpacity={0.6} />
              <Stop offset="80%" stopColor="#06091C" stopOpacity={0.85} />
              <Stop offset="100%" stopColor="#03050C" stopOpacity={1} />
            </RadialGradient>
          </Defs>
          <Circle cx={c} cy={c} r={c * 0.72} fill="url(#plate)" />
          <Circle
            cx={c}
            cy={c}
            r={c * 0.66}
            stroke={P.gold}
            strokeOpacity={0.55}
            strokeWidth={0.75}
            fill="none"
            strokeDasharray="4,4"
          />
          <Circle
            cx={c}
            cy={c}
            r={c * 0.55}
            stroke={P.starlight}
            strokeOpacity={0.35}
            strokeWidth={0.6}
            fill="none"
          />
          <Circle
            cx={c}
            cy={c}
            r={c * 0.4}
            stroke={P.gold}
            strokeOpacity={0.45}
            strokeWidth={0.75}
            fill="none"
            strokeDasharray="2,3"
          />
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i * Math.PI) / 4;
            const x1 = c + Math.cos(a) * c * 0.68;
            const y1 = c + Math.sin(a) * c * 0.68;
            const x2 = c + Math.cos(a) * c * 0.75;
            const y2 = c + Math.sin(a) * c * 0.75;
            return (
              <Line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={P.gold}
                strokeWidth={i % 2 === 0 ? 1.4 : 0.7}
                strokeOpacity={i % 2 === 0 ? 0.9 : 0.5}
                strokeLinecap="round"
              />
            );
          })}
          <Circle cx={c} cy={c} r={4} fill={P.goldBright} />
          <Circle
            cx={c}
            cy={c}
            r={8}
            stroke={P.gold}
            strokeWidth={0.6}
            fill="none"
            strokeOpacity={0.7}
          />
        </Svg>
      </Animated.View>

      {/* Lens content (children) */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.lensInner,
          { transform: [{ scale: scaleAnim }] },
        ]}
        pointerEvents="box-none"
      >
        {children}
      </Animated.View>

      {/* Layer 2: Brass outer ring (rotating) */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { transform: [{ rotate: ringRotateStr }] },
        ]}
        pointerEvents="none"
      >
        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient id="brass" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={P.goldBright} stopOpacity={1} />
              <Stop offset="35%" stopColor={P.gold} stopOpacity={0.95} />
              <Stop offset="65%" stopColor={P.goldDim} stopOpacity={0.9} />
              <Stop offset="100%" stopColor={P.goldBright} stopOpacity={1} />
            </LinearGradient>
            <LinearGradient id="brassHi" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0} />
              <Stop offset="50%" stopColor="#FFF6D8" stopOpacity={0.85} />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Circle
            cx={c}
            cy={c}
            r={c * 0.92}
            stroke="url(#brass)"
            strokeWidth={3.2}
            fill="none"
          />
          <Circle
            cx={c}
            cy={c}
            r={c * 0.84}
            stroke={P.gold}
            strokeOpacity={0.55}
            strokeWidth={0.6}
            fill="none"
          />
          <Path
            d={`M ${c - c * 0.7} ${c - c * 0.6} A ${c * 0.92} ${c * 0.92} 0 0 1 ${c + c * 0.7} ${c - c * 0.6}`}
            stroke="url(#brassHi)"
            strokeWidth={1.4}
            fill="none"
            strokeLinecap="round"
            opacity={0.85}
          />
        </Svg>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { transform: [{ rotate: shineRotate }] },
          ]}
        >
          <Svg width={size} height={size}>
            <Circle
              cx={c}
              cy={c}
              r={c * 0.92}
              stroke="#FFE9A8"
              strokeOpacity={0.18}
              strokeWidth={0.6}
              fill="none"
              strokeDasharray="2,28"
            />
          </Svg>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  lensInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AstrolabeInstrument;
