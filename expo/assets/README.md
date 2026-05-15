# ASTROLABE アセットフォルダ

## 画像の配置方法
Freepikで生成した画像をここに配置し、`constants/assets.ts` のコメントを切り替えてください。

### 必要なファイル
| ファイル名 | 使用画面 | Freepikプロンプトキーワード |
|---|---|---|
| bg_space.png | ホーム・観測・航跡 | deep indigo night sky, star field, #050A18 |
| bg_northstar.png | 北極星画面 | single north star polaris, deep dark indigo |
| bg_ocean.png | 日誌画面 | calm dark ocean at night, bioluminescent, navy |
| bg_astrolabe.png | 計器盤素材 | antique astrolabe, brass gold, dark background |

### 推奨サイズ
- 静止画: 1080×1920px（縦型、スクリーンに合わせる）
- 動画（v2以降）: 720×1280px 以下、15〜30秒ループ、30fps

## 動画の追加方法（v2以降）
1. `bunx expo install expo-av` を実行
2. `constants/assets.ts` の `Videos` オブジェクトのコメントを外す
3. `components/BackgroundView.tsx` の Video セクションのコメントを外す
