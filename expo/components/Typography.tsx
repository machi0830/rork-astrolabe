import React from 'react';
import { StyleSheet, Text, TextProps, TextStyle } from 'react-native';
import Colors from '@/constants/colors';

type Variant = 'eyebrow' | 'title' | 'heading' | 'body' | 'muted';

type Props = TextProps & {
  variant?: Variant;
  style?: TextStyle | TextStyle[];
};

export function Typo({ variant = 'body', style, ...rest }: Props) {
  return <Text {...rest} style={[styles.base, styles[variant], style]} />;
}

const styles = StyleSheet.create({
  base: {
    color: Colors.textPrimary,
  },
  eyebrow: {
    color: Colors.gold,
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: '500',
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 26,
    fontWeight: '500',
    letterSpacing: 1,
    lineHeight: 36,
  },
  heading: {
    color: Colors.textPrimary,
    fontSize: 17,
    fontWeight: '500',
    letterSpacing: 0.5,
    lineHeight: 26,
  },
  body: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 25,
  },
  muted: {
    color: Colors.textMuted,
    fontSize: 12,
    letterSpacing: 2,
  },
});

export default Typo;
