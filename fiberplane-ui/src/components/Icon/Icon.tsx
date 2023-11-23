import { ICON_MAP } from "./IconMap";

export type IconType = keyof typeof ICON_MAP;

type IconProps = React.SVGProps<SVGSVGElement> & {
  iconType: IconType;
};

export function Icon({ iconType, ...svgProps }: IconProps): JSX.Element {
  const Component = ICON_MAP[iconType];
  return <Component {...svgProps} />;
}
