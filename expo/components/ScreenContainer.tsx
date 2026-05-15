import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Colors from '@/constants/colors';

type Props = {
  children: React.ReactNode;
  keyboardAvoiding?: boolean;
  contentStyle?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
};

export function ScreenContainer({
  children,
  keyboardAvoiding = false,
  contentStyle,
  edges = ['top', 'bottom', 'left', 'right'],
}: Props) {
  const inner = (
    <View style={[styles.content, contentStyle]} testID="screen-content">
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <StatusBar style="light" />
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {inner}
        </KeyboardAvoidingView>
      ) : (
        inner
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: { flex: 1 },
  content: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
  },
});

export default ScreenContainer;
