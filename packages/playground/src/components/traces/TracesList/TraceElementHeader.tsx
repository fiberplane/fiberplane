import { formatTimestamp } from "@/components/Log";
import { Button } from "@/components/ui/button";
import { SpanStatus } from "@/constants";
import { isMizuOrphanLog } from "@/types";
import { type Waterfall, cn } from "@/utils";
import { useHandler } from "@fiberplane/hooks";
import { Icon } from "@iconify/react";
import { type HTMLAttributes, useState } from "react";
import { getLevelForSpan } from "../../Timeline/DetailsList/TimelineDetailsList/utils";
import { DurationIndicator, EventIndicator } from "../../Timeline/graph";

type Props = {
  item: Waterfall[0];
  id: string;
  startTime: Date;
  endTime: Date;
  onClickToggle: () => void;
  timelineVisible: boolean;
  minStart: number;
  duration: number;
  indent?: number;
};

export function TraceElementHeader({
  item,
  startTime,
  endTime,
  id,
  onClickToggle,
  timelineVisible: isMdScreen,
  minStart,
  duration,
  indent = 0,
}: Props) {
  const shouldShowDuration = true;
  // const [isExpanded, setIsExpanded] = useState(() => {
  //   if (isMizuOrphanLog(item)) {
  //     return item.level === "error";
  //   }

  //   return item.span.status?.code === SpanStatus.ERROR;
  // });

  // const onClickToggle = useHandler(() => setIsExpanded(!isExpanded));

  const onKeyDownToggle = useHandler((event) => {
    if (event.key === "Enter") {
      onClickToggle();
    }
  });

  if (isMizuOrphanLog(item)) {
    console.warn("TraceElementHeader should not be an orphan log!", item);
    return null;
  }

  return (
    <div
      key={id}
      className={cn(
        "max-w-full",
        "min-w-0",
        "first:rounded-t-sm transition-all",
        "group",
        "border-b border-muted-foreground/30 last:border-none",
      )}
    >
      <div
        className={cn(
          "grid",
          "py-1",
          isMdScreen
            ? "grid-cols-[2rem_auto_150px_min-content]"
            : "grid-cols-[2rem_auto_min-content]",
        )}
      >
        <DivWithHover
          onClick={onClickToggle}
          onKeyDown={onKeyDownToggle}
          className="flex items-center justify-around h-7
       pr-3 pl-1"
        >
          <Icon icon="lucide:chevrons-up-down" className="w-4 h-4" />
        </DivWithHover>
        <div
          className={cn(
            "grid",
            "grid-cols-[1fr_2rem]",
            // "items-center",
            // min width needed for ellipsis to work
            "min-w-0",
          )}
        >
          <div
            className={cn(
              // min width needed for ellipsis to work
              "min-w-0",
            )}
          >
            <button
              type="button"
              onClick={onClickToggle}
              onKeyDown={onKeyDownToggle}
              className={cn(
                "group-hover:bg-primary/10 pr-3 w-full text-left",
                // HACK - Other grid cols have h-6
                "min-h-7",
              )}
            >
              <IncomingRequestHeader
                attributes={isMizuOrphanLog(item) ? {} : item?.span?.attributes}
              />
            </button>
          </div>
          {/* <DivWithHover
            className="h-7 flex items-center justify-center text-primary grow-0 pr-3"
            onClick={onClickToggle}
            onKeyDown={onKeyDownToggle}
          >
            <Button
              size="icon-xs"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Icon icon={isExpanded ? "ph:caret-up" : "ph:caret-down"} />
            </Button>
          </DivWithHover> */}
        </div>
        {isMdScreen && (
          <DivWithHover
            className="h-7 pr-3"
            onClick={onClickToggle}
            onKeyDown={onKeyDownToggle}
          >
            {isMizuOrphanLog(item) ? (
              <EventIndicator
                timestamp={item.timestamp.getTime()}
                traceDuration={duration}
                traceStartTime={minStart}
              />
            ) : (
              <DurationIndicator
                isActive={indent === 0}
                itemStartTime={startTime.getTime()}
                itemDuration={endTime.getTime() - startTime.getTime()}
                level={getLevelForSpan(item)}
                traceDuration={duration}
                traceStartTime={minStart}
                showDuration={shouldShowDuration}
              />
            )}
          </DivWithHover>
        )}

        <DivWithHover
          onClick={onClickToggle}
          onKeyDown={onKeyDownToggle}
          className={cn(
            "text-xs font-mono text-muted-foreground",
            "min-h-7 h-7",
            "flex justify-end pl-3 items-center",
            "text-nowrap",
          )}
        >
          <div>{formatTimestamp(startTime)}</div>
        </DivWithHover>
      </div>
    </div>
  );
}

const DivWithHover = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      {...props}
      className={cn("group-hover:bg-primary/10 cursor-pointer", className)}
    >
      {children}
    </div>
  );
};

import { StatusCode } from "@/components/StatusCode";
import { SectionHeading } from "@/components/Timeline/shared";
import {
  getHttpMethodTextColor,
  getMatchedRoute,
  getRequestMethod,
  getRequestUrl,
  getStatusCode,
} from "@/utils";
import type { OtelSpan } from "@fiberplane/fpx-types";

type IncomingRequestHeaderProps = Pick<OtelSpan, "attributes">;

export function IncomingRequestHeader(props: IncomingRequestHeaderProps) {
  const { attributes } = props;

  const method = getRequestMethod({ attributes });
  const pathWithSearch = getRequestUrl({ attributes });
  const matchedRoute = getMatchedRoute({ attributes });
  const responseStatusCode = getStatusCode({ attributes });

  return (
    <div className="flex flex-col gap-2 justify-center">
      <SectionHeading className="flex items-center gap-2">
        <StatusCode
          status={responseStatusCode}
          isFailure={false}
          className="text-xs py-0.5"
        />

        <div className="inline-flex gap-2 font-mono py-0.5 text-xs bg-primary/30 text-foreground/70 rounded px-1 min-w-0">
          <span className={cn(getHttpMethodTextColor(method))}>{method}</span>
          <span className="font-light text-nowrap text-ellipsis overflow-hidden">
            {pathWithSearch}
          </span>
        </div>
        {matchedRoute && (
          <div className="flex gap-2 p-1 text-xs bg-accent rounded">
            <span className="text-gray-200 text-xs">Route:</span>
            <span className="text-gray-400 font-mono inline-block text-xs">
              {matchedRoute}
            </span>
          </div>
        )}
      </SectionHeading>
    </div>
  );
}
