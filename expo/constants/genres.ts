import Colors from '@/constants/colors';
import type { DomainId } from '@/constants/domains';

export type GenreId = 'anxiety' | 'anger' | 'mismatch' | 'selfesteem' | 'values' | 'future';

export interface Genre {
  id: GenreId;
  emoji: string;
  label: string;
  primaryDomain: DomainId;
  color: string;
}

export const GENRES: Genre[] = [
  { id: 'anxiety', emoji: '🌊', label: '不安・嫉妬', primaryDomain: 'attachment', color: Colors.attachment },
  { id: 'anger', emoji: '🔥', label: '怒り・不満', primaryDomain: 'assertion', color: Colors.relation },
  { id: 'mismatch', emoji: '📡', label: 'すれ違い', primaryDomain: 'relation', color: Colors.assertion },
  { id: 'selfesteem', emoji: '🪞', label: '自己肯定感', primaryDomain: 'bigfive', color: Colors.bigfive },
  { id: 'values', emoji: '⚓', label: '価値観の違い', primaryDomain: 'bigfive', color: Colors.eq },
  { id: 'future', emoji: '🌙', label: '別れ・未来', primaryDomain: 'eq', color: Colors.starlight },
];

export const GENRE_BY_ID: Record<GenreId, Genre> = GENRES.reduce((acc, g) => {
  acc[g.id] = g;
  return acc;
}, {} as Record<GenreId, Genre>);
