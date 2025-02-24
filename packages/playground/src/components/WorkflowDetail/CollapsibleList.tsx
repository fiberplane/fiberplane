import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/utils";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

interface CollapsibleListProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
  maxItems?: number;
  className?: string;
  empty?: () => ReactNode;
}

export function CollapsibleList<T>({
  items,
  renderItem,
  maxItems = 3,
  className,
}: CollapsibleListProps<T>) {
  if (items.length <= maxItems) {
    return (
      <div className={cn("grid gap-2", className)}>{items.map(renderItem)}</div>
    );
  }

  return (
    <Collapsible className={cn(className)}>
      <div className="grid gap-2">
        {items.slice(0, maxItems).map(renderItem)}
      </div>
      <CollapsibleContent>
        <div className="grid gap-2 mt-2">
          {items.slice(maxItems).map(renderItem)}
        </div>
      </CollapsibleContent>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1 mt-2 text-sm text-muted-foreground hover:text-foreground group"
        >
          <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          <span className="group-data-[state=closed]:hidden">Hide</span>
          <span className="group-data-[state=open]:hidden">
            Show {items.length - maxItems} More
          </span>
        </button>
      </CollapsibleTrigger>
    </Collapsible>
  );
}
