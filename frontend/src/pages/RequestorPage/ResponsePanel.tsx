import "react-resizable/css/styles.css"; // Import the styles for the resizable component

import RobotIcon from "@/assets/Robot.svg";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import {
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
  LinkBreak2Icon,
} from "@radix-ui/react-icons";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Timestamp } from "../RequestDetailsPage/Timestamp";
import { CodeMirrorJsonEditor } from "./Editors";
import { FpxDetails } from "./FpxDetails";
import { HeaderTable } from "./HeaderTable";
import { Method, StatusCode } from "./RequestorHistory";
import { CustomTabTrigger, CustomTabsContent, CustomTabsList } from "./Tabs";
import { AiTestGeneration } from "./ai";
import { Requestornator } from "./queries";
import type { ResponsePanelTab } from "./reducer";
import { type RequestType, isWsRequest } from "./types";
import { WebSocketState } from "./useMakeWebsocketRequest";

type Props = {
  activeResponsePanelTab: ResponsePanelTab;
  setActiveResponsePanelTab: (tab: string) => void;
  shouldShowResponseTab: (tab: ResponsePanelTab) => boolean;
  response?: Requestornator;
  isLoading: boolean;
  requestType: RequestType;
  websocketState: WebSocketState;
  openAiTestGenerationPanel: () => void;
  isAiTestGenerationPanelOpen: boolean;
};

export function ResponsePanel({
  activeResponsePanelTab,
  setActiveResponsePanelTab,
  shouldShowResponseTab,
  response,
  isLoading,
  requestType,
  websocketState,
  openAiTestGenerationPanel,
  isAiTestGenerationPanelOpen,
}: Props) {
  const isFailure = !!response?.app_responses?.isFailure;
  const showBottomToolbar = !!response?.app_responses?.traceId;

  const shouldShowMessages = shouldShowResponseTab("messages");

  return (
    <div className="overflow-hidden h-full relative">
      <Tabs
        value={activeResponsePanelTab}
        onValueChange={setActiveResponsePanelTab}
        className="grid grid-rows-[auto_1fr] h-full overflow-hidden"
      >
        <CustomTabsList>
          <CustomTabTrigger value="body">Response</CustomTabTrigger>
          <CustomTabTrigger value="headers">Headers</CustomTabTrigger>
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
        <CustomTabsContent value="body">
          <TabContentInner
            isLoading={isLoading}
            isEmpty={!response}
            isFailure={
              isWsRequest(requestType) ? websocketState.hasError : isFailure
            }
            LoadingState={<LoadingResponseBody />}
            FailState={
              isWsRequest(requestType) ? (
                <FailedWebsocket />
              ) : (
                <FailedRequest response={response} />
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
              <ResponseSummary response={response} />
              <ResponseBody
                response={response}
                className={cn(showBottomToolbar && "pb-16")}
              />
              {showBottomToolbar && <BottomToolbar response={response} />}
            </div>
          </TabContentInner>
        </CustomTabsContent>
        <CustomTabsContent value="headers">
          <TabContentInner
            isLoading={isLoading}
            isEmpty={!response}
            isFailure={isFailure}
            LoadingState={<LoadingHeadersTable />}
            FailState={<FailedRequest response={response} />}
            EmptyState={<NoResponse />}
          >
            <>
              <HeaderTable
                // HACK - To support absolutely positioned bottom toolbar
                className="pb-16"
                headers={response?.app_responses?.responseHeaders ?? {}}
              />
              {showBottomToolbar && <BottomToolbar response={response} />}
            </>
          </TabContentInner>
        </CustomTabsContent>
        <CustomTabsContent value="debug">
          <TabContentInner
            isLoading={isLoading}
            isEmpty={!response}
            isFailure={isFailure}
            FailState={<FailedRequest response={response} />}
            EmptyState={<NoResponse />}
          >
            <div className={cn("h-full")}>
              <FpxDetails
                response={response}
                // HACK - Allows for absolute positioned toolbar
                className={cn("pb-16")}
              />
              {showBottomToolbar && <BottomToolbar response={response} />}
            </div>
          </TabContentInner>
        </CustomTabsContent>
      </Tabs>
    </div>
  );
}

const BottomToolbar = ({ response }: { response: Requestornator }) => {
  return (
    <div className="flex justify-end gap-2 h-12 absolute w-full bottom-0 right-0 px-3 pt-1 backdrop-blur-sm">
      <div className="sm:hidden">
        <AiTestGeneration history={[response]} />
      </div>
      <Link to={`/requests/otel/${response?.app_responses?.traceId}`}>
        <Button variant="secondary">
          Go to Trace Details
          <ArrowTopRightIcon className="h-3.5 w-3.5 ml-1" />
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

function ResponseSummary({ response }: { response?: Requestornator }) {
  const status = response?.app_responses?.responseStatusCode;
  const method = response?.app_requests?.requestMethod;
  // const url = response?.app_requests?.requestUrl;
  const url = parsePathFromRequestUrl(
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
  response,
  className,
}: { response?: Requestornator; className?: string }) {
  const isFailure = response?.app_responses?.isFailure;
  const body = response?.app_responses?.responseBody;

  // This means we couldn't even contact the service
  if (isFailure) {
    return <FailedRequest response={response} />;
  }

  // Special rendering for JSON
  if (body && isJson(body)) {
    const prettyBody = JSON.stringify(JSON.parse(body), null, 2);

    return (
      <div className={cn("overflow-hidden overflow-y-auto w-full", className)}>
        <CodeMirrorJsonEditor value={prettyBody} readOnly onChange={noop} />
      </div>
    );
  }

  // For text responses, just split into lines and render with rudimentary line numbers
  // TODO - if response is empty, show that in a ux friendly way, with 204 for example

  return <ResponseBodyText body={body ?? ""} className={className} />;
}

export function ResponseBodyText({
  body,
  className,
}: { body: string; className?: string }) {
  // For text responses, just split into lines and render with rudimentary line numbers
  const lines = useMemo(() => {
    return body?.split("\n")?.map((line, index) => (
      <div key={index} className="flex h-full">
        <span className="w-8 text-right pr-2 text-gray-500 bg-muted mr-1">
          {index + 1}
        </span>
        <span>{line}</span>
      </div>
    ));
  }, [body]);

  // TODO - if response is empty, show that in a ux friendly way, with 204 for example

  return (
    <div className={cn("overflow-hidden overflow-y-auto w-full", className)}>
      <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap">
        <code className="h-full">{lines}</code>
      </pre>
    </div>
  );
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

function LoadingHeadersTable() {
  return (
    <>
      <Skeleton className="w-full h-4" />
      <div className="flex mt-2 space-x-2">
        <Skeleton className="w-[200px] h-8" />
        <Skeleton className="flex-grow h-8" />
      </div>
      <div className="flex mt-2 space-x-2">
        <Skeleton className="w-[200px] h-8" />
        <Skeleton className="flex-grow h-8" />
      </div>
      <div className="flex mt-2 space-x-2">
        <Skeleton className="w-[200px] h-8" />
        <Skeleton className="flex-grow h-8" />
      </div>
      <div className="flex mt-2 space-x-2">
        <Skeleton className="w-[200px] h-8" />
        <Skeleton className="flex-grow h-8" />
      </div>
      <div className="flex mt-2 space-x-2">
        <Skeleton className="w-[200px] h-8" />
        <Skeleton className="flex-grow h-8" />
      </div>
    </>
  );
}

function FailedRequest({ response }: { response?: Requestornator }) {
  // TODO - Show a more friendly error message
  const failureReason = response?.app_responses?.failureReason;
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
