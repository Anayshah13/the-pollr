interface Props {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
  highlightLast?: boolean;
}

export function BarTrend({
  values,
  width = 240,
  height = 60,
  color = "#e8e4d8",
  highlightLast = true,
}: Props) {
  if (!values.length) return null;
  const max = Math.max(...values);
  const barW = width / values.length - 2;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {values.map((v, i) => {
        const h = (v / max) * (height - 4);
        const x = i * (barW + 2);
        const y = height - h;
        const isLast = highlightLast && i === values.length - 1;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barW}
            height={h}
            fill={isLast ? "#d4ff3a" : color}
            opacity={isLast ? 1 : 0.55}
          />
        );
      })}
    </svg>
  );
}
