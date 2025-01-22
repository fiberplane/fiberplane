import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  usePanelConstraints,
} from "@/components/ui/resizable";
import { useIsLgScreen } from "@/hooks";
import { cn } from "@/utils";
import { useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { CommandBar } from "../CommandBar";
import { RequestPanel } from "../RequestPanel";
import { RequestorInput } from "../RequestorInput";
import { ResponsePanel } from "../ResponsePanel";
import { useMakeProxiedRequest } from "../queries";
import { useStudioStore } from "../store";
import { useRequestorSubmitHandler } from "../useRequestorSubmitHandler";
import { getMainSectionWidth } from "./util";

export const RequestorPageContent: React.FC = (_props) => {
  // const appRouteRef = useLatest<ProbedRoute | undefined>(appRoute);
  const { setShortcutsOpen } = useStudioStore("setShortcutsOpen");

  const { mutate: makeRequest, isPending: isRequestorRequesting } =
    useMakeProxiedRequest();

  // Send a request when we submit the form
  const onSubmit = useRequestorSubmitHandler({
    makeRequest,
  });

  const formRef = useRef<HTMLFormElement>(null);

  useHotkeys(
    "mod+enter",
    () => {
      if (formRef.current) {
        formRef.current.requestSubmit();
      }
    },
    {
      enableOnFormTags: ["input"],
    },
  );

  const isLgScreen = useIsLgScreen();

  const [commandBarOpen, setCommandBarOpen] = useState(false);

  useHotkeys(
    "mod+k",
    (e) => {
      e.preventDefault();
      setCommandBarOpen(true);
    },
    {
      enableOnFormTags: ["input"],
    },
  );

  useHotkeys(
    "mod+/",
    () => {
      setShortcutsOpen(true);
    },
    {
      enableOnFormTags: ["input"],
    },
  );

  const requestContent = <RequestPanel onSubmit={onSubmit} />;

  const responseContent = <ResponsePanel isLoading={isRequestorRequesting} />;

  const { minSize: requestPanelMinSize, maxSize: requestPanelMaxSize } =
    usePanelConstraints({
      // Change the groupId to `""` on small screens because we're not rendering
      // the resizable panel group
      groupId: "requestor-page-request-panel-group",
      initialGroupSize: getMainSectionWidth(),
      minPixelSize: 200,
      dimension: "width",
    });

  return (
    <div
      className={cn(
        "flex",
        "flex-col",
        "gap-2",
        "h-[calc(100%-0.6rem)]",
        "lg:h-full",
        "relative",
        "overflow-hidden",
      )}
    >
      <CommandBar open={commandBarOpen} setOpen={setCommandBarOpen} />
      <RequestorInput
        onSubmit={onSubmit}
        isRequestorRequesting={isRequestorRequesting}
        formRef={formRef}
      />
      <ResizablePanelGroup direction="vertical" id="content-panels">
        <ResizablePanel order={0} id="top-panels">
          <ResizablePanelGroup
            direction={isLgScreen ? "horizontal" : "vertical"}
            id="requestor-page-request-panel-group"
            className={cn("rounded-md", "max-w-screen", "max-h-full")}
          >
            <ResizablePanel
              order={1}
              className={cn("relative", "sm:border sm:border-r-none")}
              id="request-panel"
              minSize={
                requestPanelMinSize
                  ? Math.min(100, requestPanelMinSize)
                  : undefined
              }
              maxSize={requestPanelMaxSize}
            >
              {requestContent}
            </ResizablePanel>
            <ResizableHandle
              hitAreaMargins={{ coarse: 20, fine: 10 }}
              className="bg-transparent"
            />
            <ResizablePanel
              id="response-panel"
              order={4}
              minSize={10}
              className="sm:border sm:border-l-none"
            >
              {responseContent}
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
