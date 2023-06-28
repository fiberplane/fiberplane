import { ICON_MAP } from "./IconMap";

type IconType = keyof typeof ICON_MAP;

type Props = React.SVGProps<SVGSVGElement> & {
  type: IconType;
};

export function Icon({ type, ...svgProps }: Props): JSX.Element {
  const Component = ICON_MAP[type];
  return <Component {...svgProps} />;
}
