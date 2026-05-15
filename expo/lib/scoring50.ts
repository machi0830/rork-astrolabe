import { REVERSE_ITEMS } from '@/constants/questions50';

export type AttachmentType = 'secure' | 'anxious' | 'avoidant' | 'fearful';
export type BigFiveKey = 'N' | 'A' | 'C' | 'O' | 'E';
export type EQKey = 'selfAware' | 'otherAware' | 'useEmotion' | 'regulate';
export type HorsemanKey = 'criticism' | 'contempt' | 'defensiveness' | 'stonewalling';

export interface Scores50 {
  attachment: {
    anxietyScore: number;
    avoidanceScore: number;
    attachmentType: AttachmentType;
  };
  bigfive: {
    N: number;
    A: number;
    C: number;
    O: number;
    E: number;
    lowest: BigFiveKey;
  };
  assertion: {
    expression: number;
    boundary: number;
    conflict: number;
    total: number;
  };
  eq: {
    selfAware: number;
    otherAware: number;
    useEmotion: number;
    regulate: number;
    total: number;
    lowest: EQKey;
  };
  relation: {
    criticism: number;
    contempt: number;
    defensiveness: number;
    stonewalling: number;
    repair: number;
    total: number;
    dominantHorseman: HorsemanKey;
  };
}

const getProcessed = (answers: number[]): number[] =>
  answers.map((v, i) => (REVERSE_ITEMS.includes(i) ? 6 - v : v));

const to100 = (sum: number, count: number): number =>
  Math.round((sum / (count * 5)) * 100);

const lowestKey = <K extends string>(obj: Record<K, number>): K => {
  const entries = Object.entries(obj) as [K, number][];
  return entries.reduce((a, b) => (a[1] <= b[1] ? a : b))[0];
};

export const calcScores50 = (answers: number[]): Scores50 => {
  const p = getProcessed(answers);
  const THRESHOLD = 60;

  const anxietyScore = to100(p[0] + p[1] + p[2] + p[3] + p[4], 5);
  const avoidanceScore = to100(p[5] + p[6] + p[7] + p[8] + p[9], 5);
  const attachmentType: AttachmentType =
    anxietyScore < THRESHOLD && avoidanceScore < THRESHOLD
      ? 'secure'
      : anxietyScore >= THRESHOLD && avoidanceScore < THRESHOLD
      ? 'anxious'
      : anxietyScore < THRESHOLD && avoidanceScore >= THRESHOLD
      ? 'avoidant'
      : 'fearful';

  const bf = {
    N: to100(p[10] + p[11], 2),
    A: to100(p[12] + p[13], 2),
    C: to100(p[14] + p[15], 2),
    O: to100(p[16] + p[17], 2),
    E: to100(p[18] + p[19], 2),
  };
  const bfLowest = lowestKey<BigFiveKey>(bf);

  const assertion = {
    expression: to100(p[20] + p[21] + p[22] + p[23] + p[24], 5),
    boundary: to100(p[25] + p[26] + p[27], 3),
    conflict: to100(p[28] + p[29], 2),
    total: to100(p.slice(20, 30).reduce((a, b) => a + b, 0), 10),
  };

  const eqAxes = {
    selfAware: to100(p[30] + p[31] + p[32], 3),
    otherAware: to100(p[33] + p[34], 2),
    useEmotion: to100(p[35] + p[36], 2),
    regulate: to100(p[37] + p[38] + p[39], 3),
  };
  const eq = {
    ...eqAxes,
    total: to100(p.slice(30, 40).reduce((a, b) => a + b, 0), 10),
    lowest: lowestKey<EQKey>(eqAxes),
  };

  const horsemen = {
    criticism: to100(p[40] + p[41], 2),
    contempt: to100(p[42] + p[43], 2),
    defensiveness: to100(p[44] + p[45], 2),
    stonewalling: to100(p[46] + p[47], 2),
  };
  const relation = {
    ...horsemen,
    repair: to100(p[48] + p[49], 2),
    total: to100(p.slice(40, 50).reduce((a, b) => a + b, 0), 10),
    dominantHorseman: lowestKey<HorsemanKey>(horsemen),
  };

  return {
    attachment: { anxietyScore, avoidanceScore, attachmentType },
    bigfive: { ...bf, lowest: bfLowest },
    assertion,
    eq,
    relation,
  };
};

export const getRecommendedGenre = (eqLowest: EQKey): string => {
  const map: Record<EQKey, string> = {
    selfAware: 'selfesteem',
    otherAware: 'mismatch',
    useEmotion: 'anxiety',
    regulate: 'anger',
  };
  return map[eqLowest] ?? 'anxiety';
};
