import React, { useMemo } from 'react';
import Svg, { Circle, Line, Polygon, G, Text as SvgText } from 'react-native-svg';
import { DOMAINS, type DomainId } from '@/constants/domains';
import Colors from '@/constants/colors';

interface Props {
  size?: number;
  scores?: Partial<Record<DomainId, number>>;
}

const RING_RADII = [13, 26, 39, 52, 65];
const RING_OPACITY = [0.2, 0.16, 0.12, 0.09, 0.06];
const MAX_R = 52;

export function AstrolabeChart({ size = 130, scores }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const scale = size / 130;

  const axes = useMemo(() => {
    return DOMAINS.map((d, i) => {
      const angle = (-90 + i * 72) * (Math.PI / 180);
      const x = cx + Math.cos(angle) * MAX_R * scale;
      const y = cy + Math.sin(angle) * MAX_R * scale;
      const lx = cx + Math.cos(angle) * (MAX_R + 9) * scale;
      const ly = cy + Math.sin(angle) * (MAX_R + 9) * scale;
      return { d, x, y, lx, ly };
    });
  }, [cx, cy, scale]);

  const polygonPoints = useMemo(() => {
    if (!scores) return '';
    return DOMAINS.map((d, i) => {
      const angle = (-90 + i * 72) * (Math.PI / 180);
      const s = Math.max(0, Math.min(100, scores[d.id] ?? 0));
      const r = (s / 100) * MAX_R * scale;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      return `${x},${y}`;
    }).join(' ');
  }, [scores, cx, cy, scale]);

  return (
    <Svg width={size} height={size}>
      <G>
        {RING_RADII.map((r, i) => (
          <Circle
            key={`ring-${i}`}
            cx={cx}
            cy={cy}
            r={r * scale}
            stroke={Colors.starlight}
            strokeOpacity={RING_OPACITY[i]}
            strokeWidth={0.5}
            fill="none"
          />
        ))}

        {axes.map(({ d, x, y }) => (
          <Line
            key={`axis-${d.id}`}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke={d.color}
            strokeOpacity={0.3}
            strokeWidth={0.5}
          />
        ))}

        {polygonPoints ? (
          <Polygon
            points={polygonPoints}
            fill={Colors.starlight}
            fillOpacity={0.12}
            stroke={Colors.starlight}
            strokeWidth={1.5}
          />
        ) : null}

        <Circle cx={cx} cy={cy} r={2.5} fill={Colors.gold} />

        {axes.map(({ d, lx, ly }) => (
          <SvgText
            key={`lbl-${d.id}`}
            x={lx}
            y={ly + 3}
            fontSize={9}
            fill={d.color}
            textAnchor="middle"
          >
            {d.label.split(' ')[0]}
          </SvgText>
        ))}
      </G>
    </Svg>
  );
}

export default AstrolabeChart;
