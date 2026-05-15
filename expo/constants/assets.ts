/**
 * ASTROLABE アセット管理ファイル
 *
 * 画像・動画の差し替えはこのファイルだけを編集する。
 * Freepikで生成した素材を assets/images/ または assets/videos/ に配置後、
 * 下記の require() のコメントアウトを切り替えてください。
 *
 * 画像ファイルの命名規則:
 *   bg_space.png      → ホーム・観測画面の宇宙背景
 *   bg_northstar.png  → 北極星画面の背景
 *   bg_ocean.png      → 日誌画面の深海・夜の海背景
 *   bg_astrolabe.png  → 計器盤の素材画像
 *
 * 動画ファイルの命名規則（v2以降）:
 *   video_space.mp4   → ホーム背景動画
 *   video_stars.mp4   → 北極星画面背景動画
 */

// ─── 静止画（現在は null → LinearGradient で代替）─────────────────────────
// Freepik画像が用意できたら null を require() に切り替えてください
export const Images = {
  // ホーム・観測画面の背景（深宇宙）
  bgSpace: null as any,
  // bgSpace: require('../assets/images/bg_space.png'),

  // 北極星画面の背景
  bgNorthStar: null as any,
  // bgNorthStar: require('../assets/images/bg_northstar.png'),

  // 日誌画面の背景（深海・夜の海）
  bgOcean: null as any,
  // bgOcean: require('../assets/images/bg_ocean.png'),

  // 計器盤素材（アストロラーベ）
  bgAstrolabe: null as any,
  // bgAstrolabe: require('../assets/images/bg_astrolabe.png'),
};

// ─── 動画（v2以降・現在は未使用）────────────────────────────────────────
export const Videos = {
  // ホーム背景動画（v2以降）
  spaceLoop: null as any,
  // spaceLoop: require('../assets/videos/video_space.mp4'),

  // 北極星画面背景動画（v2以降）
  starsLoop: null as any,
  // starsLoop: require('../assets/videos/video_stars.mp4'),
};

// ─── 使用画面マッピング（どの画面にどの素材を使うか）────────────────────
export const ScreenAssets = {
  OB1Screen: { bg: Images.bgSpace, video: Videos.spaceLoop },
  OB3Screen: { bg: Images.bgSpace, video: null },
  DiagnosticHomeScreen: { bg: Images.bgAstrolabe, video: null },
  NorthStarScreen: { bg: Images.bgNorthStar, video: Videos.starsLoop },
  JournalHomeScreen: { bg: Images.bgOcean, video: null },
  WakeViewScreen: { bg: Images.bgSpace, video: null },
} as const;

export type ScreenKey = keyof typeof ScreenAssets;
