/**
 * AstrolabeInstrument
 *
 * Faithful React Native port of the Claude design "ASTROLABE Engineering"
 * Instrument (eng-instrument.jsx).
 *
 *   outerR = size * 0.46   // tick ring / outer brass
 *   innerR = size * 0.30   // mid ring
 *   coreR  = size * 0.18   // central lens / sun
 *
 * 72 ticks every 5° (every 9th = major). Stars/nebulas distribute
 * on the inner field using the golden angle (137.5°).
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, Animated, Easing, Pressable, Text } from 'react-native';
import Svg, {
  Circle,
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Line,
  G,
  Path,
} from 'react-native-svg';
import { P } from '@/constants/theme';

const AnimatedG = Animated.createAnimatedComponent(G);

export interface InstrumentState {
  stars?: { id?: string; color?: string }[];
  nebulas?: { id?: string }[];
  rules?: { id?: string }[];
}

export interface AstrolabeInstrumentProps {
  size?: number;
  state?: InstrumentState;
  centerLabel?: string;
  centerSub?: string;
  rotationLock?: number | null;
  lensState?: 'idle' | 'unfocused';
  pulsing?: boolean;
  warmth?: number;
  onTapCenter?: () => void;
  onTapStar?: (id: string) => void;
  onTapNebula?: (id: string) => void;
}

interface Tick { x1: number; y1: number; x2: number; y2: number; major: boolean; }
interface Placement { type: 'star' | 'nebula'; id: string; color?: string; x: number; y: number; }

export default function AstrolabeInstrument({
  size = 300,
  state = { stars: [], nebulas: [], rules: [] },
  centerLabel,
  centerSub,
  rotationLock = null,
  lensState = 'idle',
  pulsing = false,
  warmth = 0,
  onTapCenter,
  onTapStar,
  onTapNebula,
}: AstrolabeInstrumentProps) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.46;
  const innerR = size * 0.30;
  const coreR  = size * 0.18;

  // Rotation: natural slow drift OR ease-to lock
  const rotAnim = useRef(new Animated.Value(0)).current;
  const rotRef = useRef(0);

  useEffect(() => {
    let raf: any;
    let cancelled = false;

    if (rotationLock != null) {
      const from = rotRef.current;
      const diff = (((rotationLock - from) % 360) + 540) % 360 - 180;
      const to = from + diff;
      const start = Date.now();
      const dur = 800;
      const step = () => {
        if (cancelled) return;
        const t = Math.min(1, (Date.now() - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        rotRef.current = from + (to - from) * eased;
        rotAnim.setValue(rotRef.current);
        if (t < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    } else {
      const tick = () => {
        if (cancelled) return;
        rotRef.current = (rotRef.current + 0.008) % 360;
        rotAnim.setValue(rotRef.current);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }
    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
    };
  }, [rotationLock, rotAnim]);

  // Pulse for the core
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!pulsing) { pulseAnim.setValue(1); return; }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.00, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulsing, pulseAnim]);

  // 72 tick marks
  const ticks: Tick[] = useMemo(() => {
    const arr: Tick[] = [];
    for (let i = 0; i < 72; i++) {
      const angle = (i * 5) * Math.PI / 180;
      const isMajor = i % 9 === 0;
      const r1 = outerR - (isMajor ? 10 : 5);
      const r2 = outerR;
      arr.push({
        x1: cx + Math.cos(angle) * r1,
        y1: cy + Math.sin(angle) * r1,
        x2: cx + Math.cos(angle) * r2,
        y2: cy + Math.sin(angle) * r2,
        major: isMajor,
      });
    }
    return arr;
  }, [cx, cy, outerR]);

  // Inner field placements (golden angle)
  const placements: Placement[] = useMemo(() => {
    const items: Placement[] = [];
    (state.stars ?? []).forEach((s, i) => {
      const aDeg = (i * 137.5) % 360 - 180;
      const a = (aDeg * Math.PI) / 180;
      const d = coreR + (innerR - coreR) * (0.45 + ((i * 0.137) % 1) * 0.4);
      items.push({ type: 'star', id: s.id ?? 's' + i, color: s.color, x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d });
    });
    (state.nebulas ?? []).forEach((n, i) => {
      const aDeg = (i * 89) % 360 - 180;
      const a = (aDeg * Math.PI) / 180;
      const d = coreR + (innerR - coreR) * (0.6 + ((i * 0.211) % 1) * 0.35);
      items.push({ type: 'nebula', id: n.id ?? 'n' + i, x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d });
    });
    return items;
  }, [state.stars, state.nebulas, cx, cy, coreR, innerR]);

  const rotateStr = rotAnim.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] });
  const unfocused = lensState === 'unfocused';

  return (
    <View collapsable={undefined} style={{ width: size, height: size }} pointerEvents="box-none">
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <RadialGradient id="astro-glow" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%">
            <Stop offset="0%" stopColor={P.gold} stopOpacity={0.18} />
            <Stop offset="60%" stopColor={P.gold} stopOpacity={0.04} />
            <Stop offset="100%" stopColor={P.gold} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="core-glow" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%">
            <Stop offset="0%" stopColor={P.gold} stopOpacity={0.3 + warmth * 0.4} />
            <Stop offset="80%" stopColor={P.gold} stopOpacity={0} />
          </RadialGradient>
          <LinearGradient id="brass-outer" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={P.goldBright} stopOpacity={0.85} />
            <Stop offset="25%" stopColor={P.goldDim} stopOpacity={0.4} />
            <Stop offset="50%" stopColor={P.gold} stopOpacity={0.9} />
            <Stop offset="75%" stopColor={P.goldDim} stopOpacity={0.35} />
            <Stop offset="100%" stopColor={P.goldBright} stopOpacity={0.8} />
          </LinearGradient>
        </Defs>

        <Circle cx={cx} cy={cy} r={outerR * 1.3} fill="url(#astro-glow)" />

        <Circle cx={cx} cy={cy} r={outerR + 6} fill="none" stroke="url(#brass-outer)" strokeWidth={2.2} strokeOpacity={0.7} />

        <Path
          d={`M ${cx + Math.cos(-2.4) * (outerR + 6)} ${cy + Math.sin(-2.4) * (outerR + 6)} A ${outerR + 6} ${outerR + 6} 0 0 1 ${cx + Math.cos(-1.0) * (outerR + 6)} ${cy + Math.sin(-1.0) * (outerR + 6)}`}
          fill="none" stroke={P.goldBright} strokeWidth={1.2} strokeOpacity={0.8} strokeLinecap="round"
        />

        <Circle cx={cx} cy={cy} r={outerR} fill="none" stroke={P.gold} strokeWidth={1.5} strokeOpacity={0.55} />
        <Circle cx={cx} cy={cy} r={outerR - 14} fill="none" stroke={P.gold} strokeWidth={0.4} strokeOpacity={0.25} />

        <AnimatedG style={{ transform: [{ translateX: cx }, { translateY: cy }, { rotate: rotateStr }, { translateX: -cx }, { translateY: -cy }] }}>
          {ticks.map((t, i) => (
            <Line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
              stroke={P.gold} strokeWidth={t.major ? 1 : 0.4}
              strokeOpacity={t.major ? 0.55 : 0.22} />
          ))}
        </AnimatedG>

        <Circle cx={cx} cy={cy} r={innerR} fill="none" stroke={P.gold} strokeWidth={0.8} strokeOpacity={0.35} />

        {placements.map((p) => (
          p.type === 'star'
            ? <Circle key={p.id} cx={p.x} cy={p.y} r={3} fill={p.color ?? P.starlight} fillOpacity={0.85} />
            : <Circle key={p.id} cx={p.x} cy={p.y} r={4} fill={P.starlight} fillOpacity={0.18} />
        ))}

        <Circle
          cx={cx} cy={cy} r={coreR}
          fill="url(#core-glow)"
          stroke={P.gold}
          strokeWidth={0.6}
          strokeOpacity={unfocused ? 0.18 : 0.35}
          opacity={unfocused ? 0.4 : 1}
        />
        <Circle cx={cx} cy={cy} r={coreR - 6} fill="transparent" stroke={P.gold} strokeWidth={0.3} strokeOpacity={0.2} />
      </Svg>

      <Animated.View
        collapsable={undefined}
        pointerEvents="box-none"
        style={[
          StyleSheet.absoluteFill,
          {
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale: pulseAnim }],
            opacity: unfocused ? 0.3 : 1,
          },
        ]}
      >
        <Pressable
          onPress={onTapCenter}
          style={{ width: (coreR - 6) * 2, height: (coreR - 6) * 2, alignItems: 'center', justifyContent: 'center' }}
          hitSlop={6}
        >
          {!!centerLabel && (
            <Text
              numberOfLines={2}
              style={{
                fontSize: (centerLabel?.length ?? 0) > 8 ? 10 : 12,
                color: P.gold,
                fontWeight: '500',
                letterSpacing: 0.5,
                textAlign: 'center',
                lineHeight: 16,
              }}
            >
              {centerLabel}
            </Text>
          )}
          {!!centerSub && (
            <Text
              style={{
                fontSize: 8,
                color: P.textMuted,
                letterSpacing: 1.5,
                marginTop: 3,
                textAlign: 'center',
              }}
            >
              {centerSub}
            </Text>
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}
