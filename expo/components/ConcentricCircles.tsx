import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Colors from '@/constants/colors';

type Props = {
  size?: number;
};

const LAYERS = [
  { d: 60, base: 0.3 },
  { d: 44, base: 0.2 },
  { d: 28, base: 0.1 },
];

export default function ConcentricCircles({ size = 60 }: Props) {
  const animsRef = useRef<Animated.Value[]>(
    LAYERS.map((l) => new Animated.Value(l.base))
  );

  useEffect(() => {
    const anims = animsRef.current;
    const loops = anims.map((v, i) => {
      const base = LAYERS[i].base;
      return Animated.loop(
        Animated.sequence([
          Animated.delay(i * 1000),
          Animated.timing(v, {
            toValue: base / 3,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(v, {
            toValue: base,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    });
    loops.forEach((l) => l.start());
    return () => {
      loops.forEach((l) => l.stop());
    };
  }, []);

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      {LAYERS.map((l, i) => (
        <Animated.View
          collapsable={undefined}
          key={i}
          style={[
            styles.ring,
            {
              width: l.d,
              height: l.d,
              borderRadius: l.d / 2,
              opacity: animsRef.current[i],
            },
          ]}
        />
      ))}
      <Text style={styles.star}>✦</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    backgroundColor: Colors.starlight,
  },
  star: {
    color: Colors.gold,
    fontSize: 16,
  },
});
