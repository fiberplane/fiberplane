import type { Shape } from "../../Mondrian";
import { AreaShape } from "./AreaShape";
import { LineShape } from "./LineShape";
import { PointShape } from "./PointShape";
import { RectangleShape } from "./RectangleShape";
import type { CommonShapeProps } from "./types";

type Props<P> = CommonShapeProps & { shape: Shape<P> };

export function ChartShape<P>({ shape, ...props }: Props<P>): JSX.Element {
  switch (shape.type) {
    case "area": {
      const { areaGradientShown, ...areaProps } = props;
      return (
        <AreaShape
          area={shape}
          areaGradientShown={shape.areaGradientShown ?? areaGradientShown}
          {...areaProps}
        />
      );
    }

    case "line": {
      const { areaGradientShown, ...lineProps } = props;
      return (
        <LineShape
          line={shape}
          areaGradientShown={shape.areaGradientShown ?? areaGradientShown}
          {...lineProps}
        />
      );
    }

    case "point":
      return <PointShape point={shape} {...props} />;

    case "rectangle":
      return <RectangleShape rectangle={shape} {...props} />;
  }
}
