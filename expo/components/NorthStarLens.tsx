/**
 * NorthStarLens
 *
 * Lens content that renders the 3 states of the North Star emergence flow:
 *  - 'unset': nameless nebula (cloud glow + sparkles + "observing trajectory" message)
 *  - 'available': pulsing golden orb + ripple rings + "begin naming ceremony" CTA
 *  - 'named': set view with deep first-magnitude star (twinkles behind blur)
 *
 *  Visual port of Claude design "Astrolabe Engineering / NorthStarPanel".
 */

import React, { useEffect, useMemo, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

export type NorthStarState = 'unset' | 'available' | 'named';

export interface NorthStarLensProps {
  state: NorthStarState;
  /** statement displayed in 'named' state */
  statement?: string;
  size?: number;
  /** triggered when user taps the golden orb to begin naming ceremony */
  onBeginNaming?: () => void;
}

const P = {
  bg: '#03050C',
  gold: '#D4A853',
  goldBright: '#F0C76A',
  starlight: '#7EB8F0',
  textPrimary: '#D0D8E8',
  textMuted: '#7E8AA8',
};

export const NorthStarLens: React.FC<NorthStarLensProps> = ({
  state,
  statement,
  size = 240,
  onBeginNaming,
}) => {
  if (state === 'unset') return <UnsetView size={size} />;
  if (state === 'available')
    return <AvailableView size={size} onBeginNaming={onBeginNaming} />;
  return <NamedView size={size} statement={statement} />;
};

/* =====================================================
 * State 1: Nameless Nebula
 * ===================================================== */
const UnsetView: React.FC<{ size: number }> = ({ size }) => {
  const drift = useRef(new Animated.Value(0)).current;
  const dots = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: 8000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: 8000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
    dots.forEach((d, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 250),
          Animated.timing(d, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(d, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, [drift, dots]);

  const cloudOpacity = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0.85],
  });
  const cloudScale = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1.04],
  });

  const sparkles = useMemo(
    () =>
      Array.from({ length: 18 }).map(() => ({
        x: 0.5 + (Math.random() - 0.5) * 0.8,
        y: 0.5 + (Math.random() - 0.5) * 0.8,
        s: 1 + Math.random() * 1.2,
        d: 1500 + Math.random() * 2500,
        delay: Math.random() * 1500,
      })),
    []
  );

  const c = size / 2;
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: cloudOpacity,
            transform: [{ scale: cloudScale }],
          },
        ]}
      >
        <Svg width={size} height={size}>
          <Defs>
            <RadialGradient id="nebCloud" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={P.starlight} stopOpacity={0.55} />
              <Stop offset="45%" stopColor={P.gold} stopOpacity={0.22} />
              <Stop offset="100%" stopColor={P.bg} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={c} cy={c} r={c * 0.78} fill="url(#nebCloud)" />
        </Svg>
      </Animated.View>

      {sparkles.map((sp, i) => (
        <Sparkle
          key={i}
          x={sp.x * size}
          y={sp.y * size}
          size={sp.s}
          duration={sp.d}
          delay={sp.delay}
        />
      ))}

      <View style={styles.unsetTextWrap}>
        <Text style={styles.unsetMsg}>軌跡を観測中</Text>
        <View style={styles.dotsRow}>
          {dots.map((d, i) => (
            <Animated.Text
              key={i}
              style={[styles.dots, { opacity: d }]}
            >
              .
            </Animated.Text>
          ))}
        </View>
        <Text style={styles.unsetMsgEn}>Observing your trajectory</Text>
      </View>
    </View>
  );
};

const Sparkle: React.FC<{
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}> = ({ x, y, size, duration, delay }) => {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(a, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(a, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [a, delay, duration]);
  const opacity = a.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.95] });
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#FFFFFF',
        opacity,
      }}
    />
  );
};

/* =====================================================
 * State 2: Naming Ceremony (offering + ripples + particles + flash)
 * ===================================================== */
const AvailableView: React.FC<{ size: number; onBeginNaming?: () => void }> = ({
  size,
  onBeginNaming,
}) => {
  const beat = useRef(new Animated.Value(0)).current;
  const ripples = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(beat, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(beat, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    ripples.forEach((r, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 800),
          Animated.timing(r, {
            toValue: 1,
            duration: 2400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, [beat, ripples]);

  const orbScale = beat.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1.08],
  });
  const orbGlow = beat.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });
  const c = size / 2;
  const orbR = size * 0.18;

  return (
    <View style={[styles.center, { width: size, height: size }]}>
      {/* ripples */}
      {ripples.map((r, i) => {
        const scale = r.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 2.4],
        });
        const opacity = r.interpolate({
          inputRange: [0, 1],
          outputRange: [0.7, 0],
        });
        return (
          <Animated.View
            collapsable={undefined}
            key={i}
            style={[
              StyleSheet.absoluteFill,
              styles.center,
              { transform: [{ scale }], opacity },
            ]}
            pointerEvents="none"
          >
            <View
              style={{
                width: orbR * 2,
                height: orbR * 2,
                borderRadius: orbR,
                borderWidth: 1,
                borderColor: P.goldBright,
              }}
            />
          </Animated.View>
        );
      })}

      {/* golden orb */}
      <Animated.View
        style={[
          styles.center,
          {
            position: 'absolute',
            width: orbR * 2,
            height: orbR * 2,
            transform: [{ scale: orbScale }],
            opacity: orbGlow,
          },
        ]}
      >
        <Svg width={orbR * 2} height={orbR * 2}>
          <Defs>
            <RadialGradient id="orb" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFF6D8" stopOpacity={1} />
              <Stop offset="55%" stopColor={P.goldBright} stopOpacity={0.95} />
              <Stop offset="100%" stopColor={P.gold} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={orbR} cy={orbR} r={orbR} fill="url(#orb)" />
        </Svg>
      </Animated.View>

      {/* CTA */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.ctaButton, { top: c + orbR + 20 }]}
        onPress={onBeginNaming}
      >
        <Text style={styles.ctaText}>命名儀礼を始める</Text>
      </TouchableOpacity>
    </View>
  );
};

/* =====================================================
 * State 3: Named (first magnitude star pulsing behind blur)
 * ===================================================== */
const NamedView: React.FC<{ size: number; statement?: string }> = ({
  size,
  statement,
}) => {
  const core = useRef(new Animated.Value(0)).current;
  const halo = useRef(new Animated.Value(0)).current;
  const twinkle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(core, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(core, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(halo, {
          toValue: 1,
          duration: 3600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(halo, {
          toValue: 0,
          duration: 3600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(twinkle, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(twinkle, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [core, halo, twinkle]);

  const coreOpacity = core.interpolate({
    inputRange: [0, 1],
    outputRange: [0.55, 0.9],
  });
  const coreScale = core.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1.08],
  });
  const haloOpacity = halo.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.7],
  });
  const haloScale = halo.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });
  const twinkleOpacity = twinkle.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1],
  });
  const twinkleScale = twinkle.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  const c = size / 2;

  return (
    <View style={[styles.center, { width: size, height: size }]}>
      {/* outer halo */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.center,
          { opacity: haloOpacity, transform: [{ scale: haloScale }] },
        ]}
      >
        <Svg width={size} height={size}>
          <Defs>
            <RadialGradient id="halo" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={P.goldBright} stopOpacity={0.55} />
              <Stop offset="60%" stopColor={P.gold} stopOpacity={0.15} />
              <Stop offset="100%" stopColor={P.bg} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={c} cy={c} r={c * 0.85} fill="url(#halo)" />
        </Svg>
      </Animated.View>

      {/* inner glow */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.center,
          { opacity: coreOpacity, transform: [{ scale: coreScale }] },
        ]}
      >
        <Svg width={size} height={size}>
          <Defs>
            <RadialGradient id="coreG" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFF6D8" stopOpacity={0.9} />
              <Stop offset="40%" stopColor={P.goldBright} stopOpacity={0.5} />
              <Stop offset="100%" stopColor={P.bg} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={c} cy={c} r={c * 0.38} fill="url(#coreG)" />
        </Svg>
      </Animated.View>

      {/* point star */}
      <Animated.View
        style={{
          position: 'absolute',
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: '#FFFFFF',
          opacity: twinkleOpacity,
          transform: [{ scale: twinkleScale }],
          shadowColor: P.goldBright,
          shadowOpacity: 1,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 0 },
        }}
      />

      {statement ? (
        <View style={styles.statementWrap}>
          <Text style={styles.statementText}>{statement}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  unsetTextWrap: {
    position: 'absolute',
    alignItems: 'center',
    bottom: '18%',
  },
  unsetMsg: {
    color: P.textPrimary,
    fontSize: 13,
    letterSpacing: 3,
  },
  unsetMsgEn: {
    color: P.textMuted,
    fontSize: 9,
    letterSpacing: 1.5,
    marginTop: 6,
  },
  dotsRow: { flexDirection: 'row', height: 12, marginTop: 2 },
  dots: { color: P.textMuted, fontSize: 14, marginHorizontal: 1 },
  ctaButton: {
    position: 'absolute',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: P.goldBright,
    backgroundColor: 'rgba(212,168,83,0.15)',
  },
  ctaText: {
    color: P.goldBright,
    fontSize: 12,
    letterSpacing: 3,
  },
  statementWrap: {
    position: 'absolute',
    bottom: '12%',
    paddingHorizontal: 24,
  },
  statementText: {
    color: P.textPrimary,
    fontSize: 13,
    textAlign: 'center',
    letterSpacing: 1.5,
    lineHeight: 22,
  },
});

export default NorthStarLens;
