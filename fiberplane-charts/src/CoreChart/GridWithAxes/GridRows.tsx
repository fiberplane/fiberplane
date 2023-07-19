type Props = {
  stroke: string;
  strokeDasharray?: string;
};

export function GridRows({
  top = 0,
  left = 0,
  scale,
  width,
  stroke = "#eaf0f6",
  strokeDasharray,
  numTicks = 10,
  lineStyle,
  offset,
  tickValues,
  ...restProps
}: Props): JSX.Element {
  const ticks = tickValues ?? getTicks(scale, numTicks);
  const scaleOffset = (offset ?? 0) + getScaleBandwidth(scale) / 2;
  const tickLines = ticks.map((d, index) => {
    const y = (coerceNumber(scale(d)) ?? 0) + scaleOffset;
    return {
      index,
      from: new Point({
        x: 0,
        y,
      }),
      to: new Point({
        x: width,
        y,
      }),
    };
  });
  return (
    <g>
      {tickLines.map(({ from, to, index }) => (
        <Line
          key={`row-line-${index}`}
          from={from}
          to={to}
          stroke={stroke}
          strokeWidth={1}
          strokeDasharray={strokeDasharray}
          style={lineStyle}
          {...restProps}
        />
      ))}
    </g>
  );
}
