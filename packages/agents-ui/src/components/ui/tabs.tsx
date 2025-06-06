import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";

import { cn } from "@/lib/utils";

const TAB_HEIGHT = "h-12";

interface FpTabsProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {}

const FpTabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  FpTabsProps
>(({ className, children, ...props }, ref) => {
  return (
    <div className="flex flex-col h-full">
      <TabsPrimitive.Root ref={ref} className={className} {...props}>
        {children}
      </TabsPrimitive.Root>
    </div>
  );
});
FpTabs.displayName = "FpTabs";

const FpTabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-lg px-5 text-muted-foreground",
      "w-full justify-start rounded-none border-b gap-1 bg-transparent",
      TAB_HEIGHT,
      className,
    )}
    {...props}
  />
));
FpTabsList.displayName = "FpTabsList";

const FpTabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  // Render children as-is, supporting both strings and React components.
  // If a custom component is passed, it can handle its own click events and styling.
  // Accessibility and tab selection are preserved by TabsPrimitive.Trigger.
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md",
        "whitespace-nowrap text-sm font-medium",
        "ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "enabled:hover:bg-muted",
        "focus-visible:bg-transparent",
        "focus-visible:outline-none",
        "data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow",
        "py-1",
        "px-2",
        "text-left",
        "text-xs",
        "font-normal",
        className,
      )}
      {...props}
    >
      {children}
    </TabsPrimitive.Trigger>
  );
});
FpTabsTrigger.displayName = "FpTabsTrigger";

const FpTabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "px-5 py-4 data-[state=active]:h-full data-[state=inactive]:hidden",
      "overflow-y-auto max-h-full",
      className,
    )}
    {...props}
  />
));
FpTabsContent.displayName = "FpTabsContent";

export { FpTabs, FpTabsList, FpTabsTrigger, FpTabsContent };
