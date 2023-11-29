import { ICON_MAP } from "./IconMap";

export type IconType = keyof typeof ICON_MAP;

export function isIconType(key: unknown): key is IconType {
  return typeof key === "string" && key in ICON_MAP;
}

type IconProps = React.SVGProps<SVGSVGElement> & {
  iconType: IconType;
};

export function Icon({ iconType, ...svgProps }: IconProps): JSX.Element {
  const Component = ICON_MAP[iconType];
  return <Component {...svgProps} />;
}
