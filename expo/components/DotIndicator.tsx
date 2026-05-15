import React from 'react';
import { StyleSheet, View } from 'react-native';
import Colors from '@/constants/colors';

type Props = {
  total: number;
  active: number;
};

export function DotIndicator({ total, active }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[styles.dot, i === active ? styles.active : styles.inactive]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 1,
  },
  active: { backgroundColor: Colors.starlight },
  inactive: { backgroundColor: Colors.border },
});

export default DotIndicator;
