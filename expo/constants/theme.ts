/**
 * ASTROLABE Engineering — design tokens (palette P)
 * Mirrors eng-tokens.jsx from the Claude design source of truth.
 */

export const P = {
  bg:          '#03050C',
  bgWarm:      '#1A1208',
  surface:     '#080D1C',
  surfaceWarm: '#1C1408',

  gold:        '#D4A853',
  goldBright:  '#F0C76A',
  goldDim:     '#8A6A30',

  navy:        '#1B3568',
  starlight:   '#7EB8F0',

  textPrimary:   '#D0D8E8',
  textSecondary: '#7E8AA8',
  textMuted:     '#4A5878',
  textDim:       '#2A3858',

  border: '#101830',

  anxiety:    '#5A9EE4',
  jealousy:   '#7C7EE0',
  anger:      '#D06A6A',
  sad:        '#7AA8C0',
  loneliness: '#8A7AA8',
  shame:      '#B068A0',
  hope:       '#FFFFFF',
  warning:    '#C06868',
} as const;

export type Palette = typeof P;

export default P;
