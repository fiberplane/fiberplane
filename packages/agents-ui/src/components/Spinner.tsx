import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

export function Spinner(props: { spinning: boolean; className?: string }) {
  const { spinning, className: extraClassName } = props;
  const className = cn(
    "[animation-duration:1000ms]",
    spinning && "animate-spin",
    extraClassName,
  );
  return <RefreshCw className={className} />;
}
