import { AreaPathCoordinateFactories, createAreaPathDef } from "./paths";

type Props<P> = AreaPathCoordinateFactories<P> & {
  id: string;
  data: Array<P>;
  fillColor: string;
};

export function Threshold<P>({
  id,
  data,
  fillColor,
  x,
  y0,
  y1,
}: Props<P>): JSX.Element {
  const clipPathId = `threshold-clip-above-${id}`;

  return (
    <>
      <defs>
        <clipPath id={clipPathId}>
          <path d={createAreaPathDef(data, { x, y0: 0, y1 })} />
        </clipPath>
      </defs>
      <path
        d={createAreaPathDef(data, { x, y0, y1 })}
        clipPath={`url(#${clipPathId})`}
        strokeWidth={0}
        fill={fillColor}
      />
    </>
  );
}
