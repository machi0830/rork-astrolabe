# Skip onboarding & redirect to Astrolabe hub after login

**Goal:** 起動時のオンボーディング画面をスキップし、ログイン済みユーザーは Astrolabe メインハブ画面へ直接リダイレクトするように `app/index.tsx` を修正します。

**変更内容**
- [x] `app/index.tsx` のオンボーディング完了チェック（`onboarding_completed` AsyncStorage キー）を削除
- [x] 未ログイン時は `/auth/login` へリダイレクト（維持）
- [x] ログイン済み時は `/(tabs)/hub` へリダイレクト
- [x] `app/(tabs)/hub.tsx` をメインハブ画面の最新版で上書き
- [x] `app/(tabs)/index.tsx` を削除（Expo Router の index ルート競合を回避）
- [x] `app/(tabs)/_layout.tsx` に `initialRouteName="hub"` を追加
- [x] ローディング中の ActivityIndicator はそのまま維持

**変更対象ファイル**
- `expo/app/index.tsx`
- `expo/app/(tabs)/hub.tsx`
- `expo/app/(tabs)/index.tsx`（削除）
- `expo/app/(tabs)/_layout.tsx`
