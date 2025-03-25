import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

const animationDuration = "[animation-duration:1000ms]";

export function Spinner(props: { spinning: boolean; className?: string }) {
  const { spinning, className: extraClassName } = props;
  // sticky is used for how long the spinner should be full visible
  const rotationDuration = 1000;
  // Valid tailwind transition durations
  type Duration = 0 | 75 | 100 | 150 | 200 | 300 | 500 | 700 | 1000;
  const fadeOutDuration: Duration = 500;
  const svgClassName = cn(animationDuration, spinning && "animate-spin");
  return <RefreshCw className={svgClassName} />;
}
