import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

import ObservationScreen from './observation';
import NorthStarScreen from './northstar';
import JournalHomeScreen from './journal';
import WakeViewScreen from './wake';
import AstrolabeInstrument from '@/components/AstrolabeInstrument';
import DeepStarfield from '@/components/DeepStarfield';

const { width } = Dimensions.get('window');

type TabMode = 'observe' | 'northstar' | 'journal' | 'wake' | 'hub';

const NODE_ANGLE: Record<Exclude<TabMode, 'hub'>, number> = {
  observe: 0,
  northstar: 90,
  journal: 180,
  wake: 270,
};

interface NodeDef {
  mode: Exclude<TabMode, 'hub'>;
  glyph: string;
  label: string;
  sub: string;
}

const NODES: NodeDef[] = [
  { mode: 'observe',   glyph: '◎', label: '観測',   sub: 'OBSERVATION' },
  { mode: 'northstar', glyph: '✦', label: '北極星', sub: 'NORTH STAR'  },
  { mode: 'journal',   glyph: '◫', label: '日誌',   sub: 'JOURNAL'     },
  { mode: 'wake',      glyph: '〜', label: '航跡',   sub: 'WAKE'        },
];

const INSTRUMENT_SIZE = Math.min(width * 0.92, 380);

export default function AstrolabeHubScreen() {
  const [currentMode, setCurrentMode] = useState<TabMode>('hub');
  const [focusAngle, setFocusAngle] = useState(0);

  const contentFadeAnim = useRef(new Animated.Value(0)).current;

  const handleModeChange = (mode: TabMode) => {
    if (mode !== 'hub') {
      setFocusAngle(-NODE_ANGLE[mode]);
    } else {
      setFocusAngle(0);
    }
    Animated.timing(contentFadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setCurrentMode(mode);
      Animated.timing(contentFadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }).start();
    });
  };

  useEffect(() => {
    Animated.timing(contentFadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [contentFadeAnim]);

  const nodes = useMemo(() => {
    const radius = INSTRUMENT_SIZE / 2 - 30;
    return NODES.map((n) => {
      const rad = ((NODE_ANGLE[n.mode] - 90) * Math.PI) / 180;
      const x = INSTRUMENT_SIZE / 2 + Math.cos(rad) * radius;
      const y = INSTRUMENT_SIZE / 2 + Math.sin(rad) * radius;
      return { ...n, x, y };
    });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient
        colors={['#03050C', '#06091C', '#03050C']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <DeepStarfield count={150} />

      <SafeAreaView style={styles.safeArea}>
        {currentMode === 'hub' ? (
          <Animated.View
            collapsable={undefined}
            style={[styles.hubContainer, { opacity: contentFadeAnim }]}
          >
            <View style={styles.header}>
              <Text style={styles.brandTitle}>ASTROLABE</Text>
              <Text style={styles.brandSubtitle}>
                感情に翻弄されず、自分の海図を読む
              </Text>
            </View>

            <View style={styles.instrumentOuterContainer}>
              <View
                style={{
                  width: INSTRUMENT_SIZE,
                  height: INSTRUMENT_SIZE,
                }}
              >
                <AstrolabeInstrument
                  size={INSTRUMENT_SIZE}
                  ringAngle={focusAngle}
                  lensScale={1}
                />

                {nodes.map((n) => (
                  <TouchableOpacity
                    key={n.mode}
                    activeOpacity={0.7}
                    style={[
                      styles.nodeButton,
                      {
                        left: n.x - 32,
                        top: n.y - 28,
                      },
                    ]}
                    onPress={() => handleModeChange(n.mode)}
                  >
                    <Text style={styles.nodeGlyph}>{n.glyph}</Text>
                    <Text style={styles.nodeLabel}>{n.label}</Text>
                    <Text style={styles.nodeSub}>{n.sub}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.footerStats}>
              <Text style={styles.footerStat}>● 8 星</Text>
              <Text style={styles.footerSep}>|</Text>
              <Text style={styles.footerStat}>● 2 星雲</Text>
              <Text style={styles.footerSep}>|</Text>
              <Text style={styles.footerStat}>✦ 4 航法</Text>
            </View>
          </Animated.View>
        ) : (
          <Animated.View
            collapsable={undefined}
            style={[styles.contentContainer, { opacity: contentFadeAnim }]}
          >
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {currentMode === 'observe' && <ObservationScreen />}
              {currentMode === 'northstar' && <NorthStarScreen />}
              {currentMode === 'journal' && <JournalHomeScreen />}
              {currentMode === 'wake' && <WakeViewScreen />}
            </ScrollView>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => handleModeChange('hub')}
            >
              <Text style={styles.backButtonText}>⚓ 計器へ戻る</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#03050C' },
  safeArea: { flex: 1 },
  hubContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 24,
  },
  header: { alignItems: 'center', marginTop: 12, paddingHorizontal: 30 },
  brandTitle: {
    fontSize: 22,
    letterSpacing: 10,
    color: '#E8DCB8',
    fontWeight: '300',
  },
  brandSubtitle: {
    fontSize: 11,
    color: '#7E8AA8',
    marginTop: 10,
    textAlign: 'center',
    letterSpacing: 2,
  },
  instrumentOuterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodeButton: {
    position: 'absolute',
    width: 64,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeGlyph: {
    fontSize: 18,
    color: '#F0C76A',
  },
  nodeLabel: {
    fontSize: 11,
    color: '#D0D8E8',
    letterSpacing: 3,
    marginTop: 2,
  },
  nodeSub: {
    fontSize: 8,
    color: '#7E8AA8',
    letterSpacing: 1.4,
    marginTop: 1,
  },
  footerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  footerStat: {
    fontSize: 10,
    color: '#7E8AA8',
    letterSpacing: 1.5,
  },
  footerSep: { color: '#3A4868', marginHorizontal: 10, fontSize: 10 },
  contentContainer: { flex: 1, width },
  scrollContent: { paddingBottom: 110 },
  backButton: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: 'rgba(8,13,28,0.92)',
    borderWidth: 1,
    borderColor: '#D4A853',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 22,
  },
  backButtonText: {
    color: '#F0C76A',
    fontSize: 12,
    letterSpacing: 3,
  },
});
