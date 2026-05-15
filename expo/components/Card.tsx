import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Colors from '@/constants/colors';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
};

export function Card({ children, style }: Props) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function InnerCard({ children, style }: Props) {
  return <View style={[styles.inner, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    padding: 20,
  },
  inner: {
    backgroundColor: Colors.surfaceDeep,
    borderRadius: 10,
    padding: 16,
  },
});

export default Card;
