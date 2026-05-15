import Colors from '@/constants/colors';

export type DomainId = 'attachment' | 'bigfive' | 'assertion' | 'eq' | 'relation';

export interface Domain {
  id: DomainId;
  label: string;
  color: string;
  qRange: [number, number];
}

export const DOMAINS: Domain[] = [
  { id: 'attachment', label: '愛着スタイル', color: Colors.attachment, qRange: [0, 3] },
  { id: 'bigfive', label: 'ビッグファイブ', color: Colors.bigfive, qRange: [4, 7] },
  { id: 'assertion', label: 'アサーション', color: Colors.assertion, qRange: [8, 11] },
  { id: 'eq', label: '感情知性 EQ', color: Colors.eq, qRange: [12, 15] },
  { id: 'relation', label: '関係構築力', color: Colors.relation, qRange: [16, 19] },
];

export const DOMAIN_BY_ID: Record<DomainId, Domain> = DOMAINS.reduce((acc, d) => {
  acc[d.id] = d;
  return acc;
}, {} as Record<DomainId, Domain>);
