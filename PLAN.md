# Expo SDK 52へのダウングレード（Expo Go互換性の修正）


## 状況の説明

現在のプロジェクトは **Expo SDK 54**（最新すぎる開発版）が設定されているため、App Store / Play Store で配布されている **Expo Go アプリ（SDK 52対応）** と互換性がありません。SDK 52 にダウングレードすることで、手元のスマホの Expo Go で正常に動作するようになります。

## 変更内容

### package.json の依存関係を SDK 52 対応バージョンに変更

| パッケージ | 現在 | 変更後 |
|---|---|---|
| expo | ~54.0.27 | ~52.0.0 |
| react | 19.1.0 | 18.3.2 |
| react-native | 0.81.5 | 0.76.9 |
| expo-router | ~6.0.17 | ~4.0.15 |
| expo-blur | ~15.0.8 | ~14.0.1 |
| expo-constants | ~18.0.11 | ~17.0.5 |
| expo-font | ~14.0.10 | ~13.0.4 |
| expo-haptics | ~15.0.8 | ~14.0.0 |
| expo-image | ~3.0.11 | ~2.0.4 |
| expo-image-picker | ~17.0.9 | ~16.0.6 |
| expo-linear-gradient | ~15.0.8 | ~14.0.1 |
| expo-linking | ~8.0.10 | ~7.0.4 |
| expo-location | ~19.0.8 | ~18.0.8 |
| expo-splash-screen | ~31.0.12 | ~0.29.22 |
| expo-status-bar | ~3.0.9 | ~2.0.1 |
| expo-symbols | ~1.0.8 | ~0.2.1 |
| expo-system-ui | ~6.0.9 | ~4.0.7 |
| expo-web-browser | ~15.0.10 | ~14.0.2 |
| react-native-gesture-handler | ~2.28.0 | ~2.21.2 |
| react-native-safe-area-context | ~5.6.0 | 4.12.0 |
| react-native-screens | ~4.16.0 | ~4.4.0 |
| react-native-svg | 15.12.1 | 15.8.0 |
| react-native-worklets | 0.5.1 | 削除 |
| @expo/vector-icons | ^15.0.3 | ^14.0.4 |
| @types/react | ~19.1.10 | ~18.3.12 |

### app.json の修正

- `newArchEnabled: true` → `false` に変更（SDK 52 では New Architecture がベータ段階のため安定性を優先）

### コード互換性の確認と修正

- React 19 → React 18 の変更に伴う API の差異を確認・修正
- expo-router v6 → v4 のルーティング API の差異を修正（主に `_layout.tsx`）

## 期待される結果

- スマホの Expo Go（SDK 52対応）でプロジェクトが正常に読み込まれる
- すべての既存機能（認証・診断・日誌・航跡タブ）がそのまま動作する
