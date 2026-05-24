/**
 * DeepStarfield
 *  Background starfield rendered as 150 animated dots.
 *  Each star fades in/out at a different rhythm.
 */

import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';

interface Star {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  duration: number;
  delay: number;
}

interface Props {
  count?: number;
}

export const DeepStarfield: React.FC<Props> = ({ count = 150 }) => {
  const { width, height } = Dimensions.get('window');

  const stars = useMemo<Star[]>(
    () =>
      Array.from({ length: count }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() < 0.85 ? 1.2 : 2.2,
        baseOpacity: 0.25 + Math.random() * 0.6,
        duration: 2400 + Math.random() * 4000,
        delay: Math.random() * 2000,
      })),
    [count, width, height]
  );

  return (
    <View collapsable={undefined} style={StyleSheet.absoluteFill} pointerEvents="none">
      {stars.map((s, i) => (
        <Twinkle key={i} star={s} />
      ))}
    </View>
  );
};

const Twinkle: React.FC<{ star: Star }> = ({ star }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: star.duration,
          delay: star.delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: star.duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim, star]);

  const opacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [star.baseOpacity * 0.35, star.baseOpacity],
  });

  return (
    <Animated.View
      collapsable={undefined}
      style={{
        position: 'absolute',
        left: star.x,
        top: star.y,
        width: star.size,
        height: star.size,
        borderRadius: star.size / 2,
        backgroundColor: '#FFFFFF',
        opacity,
      }}
    />
  );
};

export default DeepStarfield;
