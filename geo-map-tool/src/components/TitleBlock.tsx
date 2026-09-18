interface TitleBlockProps {
  x: number;
  y: number;
  width: number;
  title: string;
}

export function TitleBlock({ x, y, width, title }: TitleBlockProps) {
  return (
    <g transform={`translate(${x}, ${y})`} fontFamily="system-ui, sans-serif" textAnchor="middle" fill="#111111">
      <text x={width / 2} y={12} fontSize={13} letterSpacing={1}>
        {title}
      </text>
    </g>
  );
}
