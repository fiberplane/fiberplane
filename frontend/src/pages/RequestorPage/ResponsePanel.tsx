import "react-resizable/css/styles.css"; // Import the styles for the resizable component

import RobotIcon from "@/assets/Robot.svg";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import {
  SENSITIVE_HEADERS,
  cn,
  isJson,
  noop,
  parsePathFromRequestUrl,
  truncateWithEllipsis,
} from "@/utils";
import {
  ArrowDownIcon,
  ArrowTopRightIcon,
  ArrowUpIcon,
  CaretDownIcon,
  CaretRightIcon,
  LinkBreak2Icon,
  QuestionMarkIcon,
} from "@radix-ui/react-icons";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Timestamp } from "../RequestDetailsPage/Timestamp";
import { CollapsibleKeyValueTableV2 } from "../RequestDetailsPage/v2/KeyValueTableV2";
import { SubSectionHeading } from "../RequestDetailsPage/v2/shared";
import { CodeMirrorJsonEditor } from "./Editors";
import { FpxDetails } from "./FpxDetails";
import { Method, StatusCode } from "./RequestorHistory";
import { CustomTabTrigger, CustomTabsContent, CustomTabsList } from "./Tabs";
import { AiTestGenerationDrawer } from "./ai";
import { Requestornator } from "./queries";
import type { ResponsePanelTab } from "./reducer";
import {
  RequestorActiveResponse,
  isRequestorActiveResponse,
} from "./reducer/state";
import { type RequestType, isWsRequest } from "./types";
import { WebSocketState } from "./useMakeWebsocketRequest";

type Props = {
  activeResponse: RequestorActiveResponse | null;
  activeResponsePanelTab: ResponsePanelTab;
  setActiveResponsePanelTab: (tab: string) => void;
  shouldShowResponseTab: (tab: ResponsePanelTab) => boolean;
  tracedResponse?: Requestornator;
  isLoading: boolean;
  requestType: RequestType;
  websocketState: WebSocketState;
  openAiTestGenerationPanel: () => void;
  isAiTestGenerationPanelOpen: boolean;
};

export function ResponsePanel({
  activeResponse,
  activeResponsePanelTab,
  setActiveResponsePanelTab,
  shouldShowResponseTab,
  tracedResponse,
  isLoading,
  requestType,
  websocketState,
  openAiTestGenerationPanel,
  isAiTestGenerationPanelOpen,
}: Props) {
  // NOTE - If we have a "raw" response, we want to render that, so we can (e.g.,) show binary data
  const responseToRender = activeResponse ?? tracedResponse;

  const isFailure = isRequestorActiveResponse(responseToRender)
    ? responseToRender.isFailure
    : responseToRender?.app_responses?.isFailure;

  // FIXME - This should actually look if the trace exists in the database
  //         Since a trace ID will still be created even if we request a non-existent route OR against a service that doesn't exist
  const hasTraceId = isRequestorActiveResponse(responseToRender)
    ? !!responseToRender?.traceId
    : !!responseToRender?.app_responses?.traceId;

  const showBottomToolbar = !!responseToRender;
  const disableGoToTraceButton = !hasTraceId;

  const responseHeaders = isRequestorActiveResponse(responseToRender)
    ? responseToRender.responseHeaders
    : responseToRender?.app_responses?.responseHeaders;

  const shouldShowMessages = shouldShowResponseTab("messages");

  return (
    <div className="overflow-hidden h-full relative">
      <Tabs
        value={activeResponsePanelTab}
        onValueChange={setActiveResponsePanelTab}
        className="grid grid-rows-[auto_1fr] h-full overflow-hidden"
      >
        <CustomTabsList>
          <CustomTabTrigger value="response">Response</CustomTabTrigger>
          {shouldShowMessages && (
            <CustomTabTrigger value="messages">Messages</CustomTabTrigger>
          )}
          <CustomTabTrigger value="debug">Debug</CustomTabTrigger>
          <div
            className={cn(
              // Hide this button on mobile, and rely on the button + drawer pattern instead
              "max-sm:hidden",
              "flex-grow sm:flex justify-end",
            )}
          >
            <Button
              variant={isAiTestGenerationPanelOpen ? "outline" : "ghost"}
              size="icon"
              onClick={openAiTestGenerationPanel}
              className={cn(
                isAiTestGenerationPanelOpen && "opacity-50 bg-slate-900",
              )}
            >
              <RobotIcon className="h-4 w-4 cursor-pointer" />
            </Button>
          </div>
        </CustomTabsList>
        <CustomTabsContent value="messages">
          <TabContentInner
            isLoading={websocketState.isConnecting}
            isEmpty={
              !websocketState.isConnected && !websocketState.isConnecting
            }
            isFailure={websocketState.hasError}
            LoadingState={<LoadingResponseBody />}
            FailState={<FailedWebsocket />}
            EmptyState={<NoWebsocketConnection />}
          >
            <WebsocketMessages websocketState={websocketState} />
          </TabContentInner>
        </CustomTabsContent>
        <CustomTabsContent value="response">
          <TabContentInner
            isLoading={isLoading}
            isEmpty={!responseToRender}
            isFailure={
              isWsRequest(requestType) ? websocketState.hasError : !!isFailure
            }
            LoadingState={<LoadingResponseBody />}
            FailState={
              isWsRequest(requestType) ? (
                <FailedWebsocket />
              ) : (
                <FailedRequest response={tracedResponse} />
              )
            }
            EmptyState={
              isWsRequest(requestType) ? (
                <NoWebsocketConnection />
              ) : (
                <NoResponse />
              )
            }
          >
            <div className={cn("h-full grid grid-rows-[auto_1fr]")}>
              <ResponseSummary response={responseToRender} />
              <ResponseBody
                headersSlot={
                  <CollapsibleKeyValueTableV2
                    sensitiveKeys={SENSITIVE_HEADERS}
                    title="Headers"
                    keyValue={responseHeaders ?? {}}
                    className="mb-2"
                  />
                }
                response={responseToRender}
                // HACK - To support absolutely positioned bottom toolbar
                className={cn(showBottomToolbar && "pb-16")}
              />
              {showBottomToolbar && (
                <BottomToolbar
                  response={tracedResponse}
                  disableGoToTraceButton={disableGoToTraceButton}
                />
              )}
            </div>
          </TabContentInner>
        </CustomTabsContent>
        <CustomTabsContent value="debug">
          <TabContentInner
            isLoading={isLoading}
            isEmpty={!tracedResponse}
            isFailure={!!isFailure}
            FailState={<FailedRequest response={tracedResponse} />}
            EmptyState={<NoResponse />}
          >
            <div className={cn("h-full")}>
              <FpxDetails
                response={tracedResponse}
                // HACK - Allows for absolute positioned toolbar
                className={cn(showBottomToolbar && "pb-16")}
              />
              {showBottomToolbar && (
                <BottomToolbar
                  response={tracedResponse}
                  disableGoToTraceButton={disableGoToTraceButton}
                />
              )}
            </div>
          </TabContentInner>
        </CustomTabsContent>
      </Tabs>
    </div>
  );
}

function CollapsibleBodyContainer({
  className,
  defaultCollapsed = false,
  title = "Body",
  children,
}: {
  emptyMessage?: string;
  className?: string;
  defaultCollapsed?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(!defaultCollapsed);
  const toggleIsOpen = () => setIsOpen((o) => !o);

  return (
    <div className={cn(className, "border-t", "pt-2")}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <SubSectionHeading
            className="flex items-center gap-2"
            onClick={toggleIsOpen}
          >
            {isOpen ? (
              <CaretDownIcon className="w-4 h-4 cursor-pointer" />
            ) : (
              <CaretRightIcon className="w-4 h-4 cursor-pointer" />
            )}
            {title}
          </SubSectionHeading>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">{children}</CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// TODO - When there's no matching trace, don't allow the user to go to trace details
const BottomToolbar = ({
  response,
  disableGoToTraceButton,
}: { response?: Requestornator | null; disableGoToTraceButton: boolean }) => {
  const traceId = response?.app_responses?.traceId;

  return (
    <div className="flex justify-end gap-2 h-12 absolute w-full bottom-0 right-0 px-3 pt-1 backdrop-blur-sm">
      <div className="sm:hidden">
        <AiTestGenerationDrawer history={response ? [response] : null} />
      </div>
      <Link
        to={`/requests/otel/${traceId}`}
        className={cn(disableGoToTraceButton && "pointer-events-none")}
      >
        <Button variant="secondary" disabled={disableGoToTraceButton}>
          {disableGoToTraceButton ? (
            "Cannot Find Trace"
          ) : (
            <>
              Go to Trace Details
              <ArrowTopRightIcon className="h-3.5 w-3.5 ml-1" />
            </>
          )}
        </Button>
      </Link>
    </div>
  );
};

function WebsocketMessages({
  websocketState,
}: { websocketState: WebSocketState }) {
  return (
    <div className={cn("h-full grid grid-rows-[auto_1fr]")}>
      <div className="text-sm uppercase text-gray-400">Messages</div>
      <div>
        <Table>
          <TableBody>
            {websocketState.messages.map((message, index) => (
              <TableRow key={message?.timestamp ?? index}>
                <TableCell className="w-5">
                  {message.type === "received" ? (
                    <ArrowDownIcon className="h-3.5 w-3.5 text-green-400" />
                  ) : (
                    <ArrowUpIcon className="h-3.5 w-3.5 text-blue-400" />
                  )}
                </TableCell>
                <TableCell className="truncate max-w-[120px] overflow-hidden text-ellipsis text-xs font-mono">
                  {truncateWithEllipsis(message?.data, 100)}
                </TableCell>
                <TableCell className="w-12 text-right text-gray-400 text-xs">
                  {message?.timestamp ? (
                    <div className="p-1 border rounded bg-slate-800/90">
                      <Timestamp date={message?.timestamp} />
                    </div>
                  ) : (
                    "—"
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/**
 * Helper component for handling loading/failure/empty states in tab content
 */
function TabContentInner({
  isLoading,
  isEmpty,
  isFailure,
  LoadingState = <Loading />,
  EmptyState,
  FailState,
  children,
}: {
  children: React.ReactNode;
  EmptyState: JSX.Element;
  FailState: JSX.Element;
  LoadingState?: JSX.Element;
  isFailure: boolean;
  isLoading: boolean;
  isEmpty: boolean;
}) {
  return isLoading ? (
    <>{LoadingState}</>
  ) : isFailure ? (
    <>{FailState}</>
  ) : !isEmpty ? (
    <>{children}</>
  ) : (
    <>{EmptyState}</>
  );
}

function ResponseSummary({
  response,
}: { response?: Requestornator | RequestorActiveResponse }) {
  const status = isRequestorActiveResponse(response)
    ? response?.responseStatusCode
    : response?.app_responses?.responseStatusCode;
  const method = isRequestorActiveResponse(response)
    ? response?.requestMethod
    : response?.app_requests?.requestMethod;
  const url = isRequestorActiveResponse(response)
    ? response?.requestUrl
    : parsePathFromRequestUrl(
        response?.app_requests?.requestUrl ?? "",
        response?.app_requests?.requestQueryParams ?? undefined,
      );
  return (
    <div className="flex items-center mb-4 space-x-2 text-sm">
      <StatusCode status={status ?? "—"} isFailure={!status} />
      <div>
        <Method method={method ?? "—"} />
        <span
          className={cn(
            "font-mono",
            "whitespace-nowrap",
            "overflow-ellipsis",
            "ml-2",
            "pt-0.5", // HACK - to adjust baseline of mono font to look good next to sans
          )}
        >
          {url}
        </span>
      </div>
    </div>
  );
}

function ResponseBody({
  headersSlot,
  response,
  className,
}: {
  headersSlot?: React.ReactNode;
  response?: Requestornator | RequestorActiveResponse;
  className?: string;
}) {
  const isFailure = isRequestorActiveResponse(response)
    ? response?.isFailure
    : response?.app_responses?.isFailure;

  // This means we couldn't even contact the service
  if (isFailure) {
    return <FailedRequest response={response} />;
  }

  if (isRequestorActiveResponse(response)) {
    const body = response?.responseBody;
    if (body?.type === "error") {
      return <FailedRequest response={response} />;
    }

    if (body?.type === "text" || body?.type === "html") {
      return (
        <div
          className={cn("overflow-hidden overflow-y-auto w-full", className)}
        >
          {headersSlot}
          <CollapsibleBodyContainer>
            <ResponseBodyText body={body.value} className={className} />
          </CollapsibleBodyContainer>
        </div>
      );
    }

    if (body?.type === "json") {
      const prettyBody = JSON.stringify(safeParseJson(body.value), null, 2);

      return (
        <div
          className={cn("overflow-hidden overflow-y-auto w-full", className)}
        >
          {headersSlot}
          <CollapsibleBodyContainer>
            <CodeMirrorJsonEditor value={prettyBody} readOnly onChange={noop} />
          </CollapsibleBodyContainer>
        </div>
      );
    }

    // TODO
    if (body?.type === "binary") {
      return (
        <div
          className={cn("overflow-hidden overflow-y-auto w-full", className)}
        >
          {headersSlot}
          <CollapsibleBodyContainer>
            <ResponseBodyBinary body={body} />;
          </CollapsibleBodyContainer>
        </div>
      );
    }

    // TODO - Stylize
    if (body?.type === "unknown") {
      return (
        <UnknownResponse headersSlot={headersSlot} className={className} />
      );
    }

    return <UnknownResponse headersSlot={headersSlot} className={className} />;
  }

  if (!isRequestorActiveResponse(response)) {
    const body = response?.app_responses?.responseBody;

    // Special rendering for JSON
    if (body && isJson(body)) {
      const prettyBody = JSON.stringify(JSON.parse(body), null, 2);

      return (
        <div
          className={cn("overflow-hidden overflow-y-auto w-full", className)}
        >
          {headersSlot}
          <CollapsibleBodyContainer>
            <CodeMirrorJsonEditor value={prettyBody} readOnly onChange={noop} />
          </CollapsibleBodyContainer>
        </div>
      );
    }

    // For text responses, just split into lines and render with rudimentary line numbers
    // TODO - if response is empty, show that in a ux friendly way, with 204 for example

    return (
      <div className={cn("overflow-hidden overflow-y-auto w-full", className)}>
        {headersSlot}
        <CollapsibleBodyContainer>
          <ResponseBodyText body={body ?? ""} className={className} />
        </CollapsibleBodyContainer>
      </div>
    );
  }
}

function UnknownResponse({
  className,
  headersSlot,
}: {
  headersSlot: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden overflow-y-auto w-full", className)}>
      {headersSlot}
      <CollapsibleBodyContainer>
        <div className="text-gray-400 py-20 flex flex-col items-center justify-center gap-4">
          <QuestionMarkIcon className="h-8 w-8" />
          <span className="text-gray-200 italic">
            Unknown response type, cannot render body
          </span>
        </div>
      </CollapsibleBodyContainer>
    </div>
  );
}

function ResponseBodyBinary({
  body,
}: {
  body: { contentType: string; type: "binary"; value: ArrayBuffer };
}) {
  const isImage = body.contentType.startsWith("image/");

  if (isImage) {
    const blob = new Blob([body.value], { type: body.contentType });
    const imageUrl = URL.createObjectURL(blob);
    return (
      <img
        src={imageUrl}
        alt="Response Image"
        className="max-w-full h-auto"
        onLoad={() => URL.revokeObjectURL(imageUrl)}
      />
    );
  }

  // TODO - Stylize
  return <div>Binary response {body.contentType}</div>;
}

export function ResponseBodyText({
  body,
  maxPreviewLength = null,
  maxPreviewLines = null,
  defaultExpanded = false,
  className,
}: {
  body: string;
  maxPreviewLength?: number | null;
  maxPreviewLines?: number | null;
  defaultExpanded?: boolean;
  className?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(!!defaultExpanded);
  const toggleIsExpanded = () => setIsExpanded((e) => !e);

  // For text responses, just split into lines and render with rudimentary line numbers
  const { lines, hiddenLinesCount, hiddenCharsCount, shouldShowExpandButton } =
    useTextPreview(body, isExpanded, maxPreviewLength, maxPreviewLines);

  // TODO - if response is empty, show that in a ux friendly way, with 204 for example

  return (
    <div
      className={cn("overflow-hidden overflow-y-auto w-full py-2", className)}
    >
      <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap">
        <code className="h-full">{lines}</code>
      </pre>
      {shouldShowExpandButton && (
        <div
          className={cn(
            "w-full flex flex-row items-center gap-2 mt-4 border-t border-gray-500/50",
          )}
        >
          {!isExpanded && (
            <div className="text-sm text-gray-400">
              {hiddenLinesCount > 0 ? (
                <>{hiddenLinesCount} lines hidden</>
              ) : (
                <>{hiddenCharsCount} characters hidden</>
              )}
            </div>
          )}
          <Button
            variant="ghost"
            onClick={toggleIsExpanded}
            className="text-blue-400 font-normal py-1 px-1 hover:bg-transparent hover:text-blue-400 hover:underline"
          >
            {isExpanded ? "Show Less" : "Show More"}
          </Button>
        </div>
      )}
    </div>
  );
}

function useTextPreview(
  body: string,
  isExpanded: boolean,
  maxPreviewLength: number | null,
  maxPreviewLines: number | null,
) {
  return useMemo(() => {
    let hiddenCharsCount = 0;
    let hiddenLinesCount = 0;
    const allLinesCount = body.split("\n")?.length;

    const exceedsMaxPreviewLength = maxPreviewLength
      ? body.length > maxPreviewLength
      : false;

    const exceedsMaxPreviewLines = maxPreviewLines
      ? allLinesCount > maxPreviewLines
      : false;

    // If we're not expanded, we want to show a preview of the body depending on the maxPreviewLength
    let previewBody = body;
    if (maxPreviewLength && exceedsMaxPreviewLength && !isExpanded) {
      previewBody = body ? body.slice(0, maxPreviewLength) + "..." : "";
      hiddenCharsCount = body.length - maxPreviewLength;
    }

    let previewLines = previewBody?.split("\n");
    if (
      maxPreviewLines &&
      !isExpanded &&
      previewLines.length > maxPreviewLines
    ) {
      previewLines = previewLines.slice(0, maxPreviewLines);
      previewBody = `${previewLines.join("\n")}...`;
      hiddenLinesCount = allLinesCount - previewLines.length;
    }

    const lines = (isExpanded ? body : previewBody)
      ?.split("\n")
      ?.map((line, index) => (
        <div key={index} className="flex h-full">
          <span className="w-8 text-right pr-2 text-gray-500 bg-muted mr-1">
            {index + 1}
          </span>
          <span>{line}</span>
        </div>
      ));

    return {
      lines,
      shouldShowExpandButton: exceedsMaxPreviewLength || exceedsMaxPreviewLines,
      hiddenLinesCount,
      hiddenCharsCount,
    };
  }, [body, maxPreviewLines, maxPreviewLength, isExpanded]);
}

function NoResponse() {
  return (
    <div className="h-full pb-8 sm:pb-20 md:pb-32 flex flex-col items-center justify-center p-4">
      <div className="text-md text-white text-center">
        Enter a URL and hit send to see a response
      </div>
      <div className="mt-1 sm:mt-2 text-ms text-gray-400 text-center font-light">
        Or load a past request from your history
      </div>
    </div>
  );
}

function NoWebsocketConnection() {
  return (
    <div className="h-full pb-8 sm:pb-20 md:pb-32 flex flex-col items-center justify-center p-4">
      <div className="text-md text-white text-center">
        Enter a WebSocket URL and click Connect to start receiving messages
      </div>
      <div className="mt-1 sm:mt-2 text-ms text-gray-400 text-center font-light">
        You can send and view messages in the Messages tabs
      </div>
    </div>
  );
}

function Loading() {
  return (
    <>
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-full h-32 mt-2" />
    </>
  );
}

function LoadingResponseBody() {
  return (
    <>
      <div className="flex space-x-2">
        <Skeleton className="w-16 h-4" />
        <Skeleton className="w-8 h-4" />
        <Skeleton className="w-full h-4" />
      </div>
      <Skeleton className="w-full h-32 mt-2" />
    </>
  );
}

function FailedRequest({
  response,
}: { response?: Requestornator | RequestorActiveResponse }) {
  // TODO - Show a more friendly error message
  const failureReason = isRequestorActiveResponse(response)
    ? null
    : response?.app_responses?.failureReason;
  const friendlyMessage =
    failureReason === "fetch failed" ? "Service unreachable" : null;
  // const failureDetails = response?.app_responses?.failureDetails;
  return (
    <div className="h-full pb-8 sm:pb-20 md:pb-32 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center p-4">
        <LinkBreak2Icon className="h-10 w-10 text-red-200" />
        <div className="mt-4 text-md text-white text-center">
          {friendlyMessage
            ? `Request failed: ${friendlyMessage}`
            : "Request failed"}
        </div>
        <div className="mt-2 text-ms text-gray-400 text-center font-light">
          Make sure your api is up and has FPX Middleware enabled!
        </div>
      </div>
    </div>
  );
}

function FailedWebsocket() {
  return (
    <div className="h-full pb-8 sm:pb-20 md:pb-32 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center p-4">
        <LinkBreak2Icon className="h-10 w-10 text-red-200" />
        <div className="mt-4 text-md text-white text-center">
          Websocket connection failed
        </div>
        <div className="mt-2 text-ms text-gray-4000 text-center font-light">
          Make sure your api is up and running
        </div>
      </div>
    </div>
  );
}

const safeParseJson = (jsonString: string) => {
  try {
    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    return jsonString;
  }
};
