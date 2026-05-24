/**
 * CardinalNav
 *
 * Four cardinal nav buttons positioned just outside the instrument's outer ring.
 * Mirrors eng-cardinal.jsx (ObservationGlyph/NorthStarGlyph/JournalGlyph/WakeGlyph).
 *
 *  -90° top    : 観測    / OBSERVATION
 *    0° right  : 北極星 / NORTH STAR
 *   90° bottom : 日誌    / JOURNAL
 *  180° left   : 航跡    / WAKE
 */

import React from 'react';
import { Pressable, View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle, Path, Line } from 'react-native-svg';
import { P } from '@/constants/theme';

export type CardinalDirection = 'observation' | 'northstar' | 'journal' | 'wake';

interface GlyphProps { color?: string; size?: number; }

function ObservationGlyph({ color = P.gold, size = 18 }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1} fill="none" />
      <Circle cx={12} cy={12} r={4.5} stroke={color} strokeWidth={0.7} fill="none" />
      <Circle cx={12} cy={12} r={1.2} fill={color} />
    </Svg>
  );
}

function NorthStarGlyph({ color = P.gold, size = 20 }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z"
        fill={color}
        stroke={color}
        strokeWidth={0.5}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function JournalGlyph({ color = P.gold, size = 18 }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M5 4 L19 4 L19 19 L12 16 L5 19 Z"
        stroke={color}
        strokeWidth={1}
        strokeLinejoin="round"
        fill="none"
      />
      <Line x1={9} y1={9} x2={15} y2={9} stroke={color} strokeWidth={0.7} strokeLinecap="round" />
      <Line x1={9} y1={12} x2={14} y2={12} stroke={color} strokeWidth={0.7} strokeLinecap="round" />
    </Svg>
  );
}

function WakeGlyph({ color = P.gold, size = 18 }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M2 14 C 5 10, 8 14, 11 11 S 17 8, 22 11" stroke={color} strokeWidth={1} strokeLinecap="round" fill="none" />
      <Path d="M2 18 C 5 15, 8 18, 11 16 S 17 13, 22 16" stroke={color} strokeWidth={0.7} strokeOpacity={0.6} strokeLinecap="round" fill="none" />
      <Circle cx={22} cy={11} r={1.5} fill={color} />
    </Svg>
  );
}

const CARDINAL_DEFS = {
  observation: { angle: -90, label: '観測',    sub: 'OBSERVATION', Glyph: ObservationGlyph, vAlign: 'above' as const },
  northstar:   { angle:   0, label: '北極星', sub: 'NORTH STAR',  Glyph: NorthStarGlyph,   vAlign: 'right' as const },
  journal:     { angle:  90, label: '日誌',    sub: 'JOURNAL',     Glyph: JournalGlyph,     vAlign: 'below' as const },
  wake:        { angle: 180, label: '航跡',    sub: 'WAKE',        Glyph: WakeGlyph,        vAlign: 'left' as const },
};

export interface CardinalProps {
  direction: CardinalDirection;
  hubSize?: number;        // total layout box (e.g. 360)
  instrumentSize?: number; // inner instrument (e.g. 300)
  active?: CardinalDirection | null;
  onTap?: (dir: CardinalDirection) => void;
}

// Fixed nav cell size used for translate centering.
const CELL_W = 88;
const CELL_H = 56;

export default function Cardinal({ direction, hubSize = 360, instrumentSize = 300, active, onTap }: CardinalProps) {
  const def = CARDINAL_DEFS[direction];
  const outerR = instrumentSize * 0.46;
  const offset = outerR + 28;
  const center = hubSize / 2;
  const rad = (def.angle * Math.PI) / 180;
  const x = center + Math.cos(rad) * offset;
  const y = center + Math.sin(rad) * offset;

  const isStarPulse = direction === 'northstar';
  const pulse = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    if (!isStarPulse) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isStarPulse, pulse]);
  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });
  const pulseOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] });

  const accentColor = isStarPulse ? P.goldBright : P.gold;
  const opacity = active && active !== direction ? 0.25 : 1;

  const Glyph = def.Glyph;
  const glyphNode = (
    <View style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
      {isStarPulse && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: P.gold,
            opacity: pulseOpacity,
            transform: [{ scale: pulseScale }],
          }}
        />
      )}
      <Glyph color={accentColor} size={direction === 'northstar' ? 20 : 18} />
    </View>
  );

  const labelNode = (textAlign: 'left' | 'right' | 'center') => (
    <View style={{ alignItems: textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center' }}>
      <Text style={{ fontSize: 10, color: accentColor, letterSpacing: 1.5, fontWeight: '500' }}>{def.label}</Text>
      <Text style={{ fontSize: 7, color: P.textDim, letterSpacing: 2.5, fontWeight: '500', marginTop: 1 }}>{def.sub}</Text>
    </View>
  );

  let content: React.ReactNode;
  if (def.vAlign === 'above') {
    // glyph on bottom, label on top - this is for the TOP cardinal (observation)
    content = (
      <View style={{ alignItems: 'center' }}>
        {labelNode('center')}
        <View style={{ height: 4 }} />
        {glyphNode}
      </View>
    );
  } else if (def.vAlign === 'below') {
    // glyph on top, label on bottom - for BOTTOM cardinal (journal)
    content = (
      <View style={{ alignItems: 'center' }}>
        {glyphNode}
        <View style={{ height: 4 }} />
        {labelNode('center')}
      </View>
    );
  } else if (def.vAlign === 'right') {
    // glyph on left, label on right - for RIGHT cardinal (northstar)
    content = (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {glyphNode}
        <View style={{ width: 8 }} />
        {labelNode('left')}
      </View>
    );
  } else {
    // 'left': label on left, glyph on right - for LEFT cardinal (wake)
    content = (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {labelNode('right')}
        <View style={{ width: 8 }} />
        {glyphNode}
      </View>
    );
  }

  return (
    <Pressable
      onPress={() => onTap && onTap(direction)}
      hitSlop={10}
      style={[
        styles.wrap,
        {
          left: x - CELL_W / 2,
          top: y - CELL_H / 2,
          width: CELL_W,
          height: CELL_H,
          opacity,
        },
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const CARDINAL_ANGLE = {
  observation: -90,
  northstar: 0,
  journal: 90,
  wake: 180,
} as const;
