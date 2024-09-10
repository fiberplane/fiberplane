import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useKeySequence } from "@/hooks/useKeySequence";
import { cn } from "@/utils";
import React, { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { BACKGROUND_LAYER } from "../styles";
import { RequestsPanel } from "./RequestsPanel";
import { RoutesPanel } from "./RoutesPanel";

const FILTER_TAB_KEY = "filter-tab";
const TAB_KEYS = ["routes", "requests"] as const;
type NavigationTab = (typeof TAB_KEYS)[number];

function getTab(searchParams: URLSearchParams): NavigationTab {
  const tab = searchParams.get(FILTER_TAB_KEY);
  if (tab && TAB_KEYS.includes(tab as NavigationTab)) {
    return tab as NavigationTab;
  }

  return "routes";
}

export function NavigationPanel() {
  const [params, setParams] = useSearchParams();
  const tab = getTab(params);

  const tabRefs = useMemo(() => {
    return TAB_KEYS.reduce(
      (acc, key) => {
        acc[key] = React.createRef<HTMLButtonElement>();
        return acc;
      },
      {} as Record<NavigationTab, React.RefObject<HTMLButtonElement>>,
    );
  }, []);

  const setTab = useCallback(
    (newTab: NavigationTab) => {
      setParams(
        (value) => {
          value.set(FILTER_TAB_KEY, newTab);
          return value;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  useKeySequence(["g", "r"], () => setTab("routes"));
  useKeySequence(["g", "a"], () => setTab("requests"));

  return (
    <div
      className={cn(
        BACKGROUND_LAYER,
        "px-4 overflow-hidden border rounded-md",
        "h-full",
        "flex",
        "flex-col",
        "pt-4",
      )}
    >
      <Tabs
        value={tab}
        className="h-full"
        onValueChange={(tabValue: string) => setTab(tabValue as NavigationTab)}
      >
        <TabsList className="w-full grid grid-cols-2">
          {TAB_KEYS.map((tabKey) => (
            <TabsTrigger key={tabKey} ref={tabRefs[tabKey]} value={tabKey}>
              {tabKey.charAt(0).toUpperCase() + tabKey.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="routes" className="h-full pt-4">
          <RoutesPanel />
        </TabsContent>
        <TabsContent value="requests" className="h-full pt-4">
          <RequestsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
