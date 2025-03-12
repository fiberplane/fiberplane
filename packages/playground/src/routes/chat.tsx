import { Layout } from "@/Layout";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import type { Message } from "@ai-sdk/react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { useRef, useEffect, useState } from "react";
import {
  Send,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/utils";
import { Method } from "@/components/Method";
import { useMakePlaygroundRequest } from "@/components/playground/queries";
import { useServiceBaseUrl } from "@/components/playground/store";
import { reduceKeyValueElements } from "@/components/playground/KeyValueForm";
import type {
  KeyValueElement,
  PlaygroundBody,
} from "@/components/playground/store";

interface ChatHistoryProps {
  messages: Message[];
  isLoading: boolean;
  error: Error | undefined;
  onRetry?: () => void;
}

function ErrorCard({
  error,
  onRetry,
}: {
  error: Error;
  onRetry?: () => void;
}): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="py-2 px-4 flex flex-col gap-2 transition-opacity duration-200 shadow-sm rounded-lg border-danger/50">
      <div className="grid grid-cols-[1fr,auto] items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-danger">
          <AlertCircle className="h-4 w-4" />
          <span className="font-medium text-sm">An error occurred</span>
        </div>
        <div className="grid grid-cols-[1fr,auto] items-center gap-2">
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            className="text-foreground/60 hover:text-foreground"
          >
            {isExpanded ? "Hide details" : "Show details"}
          </Button>
          {onRetry && (
            <Button size="icon" variant="ghost" onClick={onRetry}>
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t pt-2">
          <p className="font-mono text-xs text-danger whitespace-pre-wrap">
            {error?.message}
          </p>
        </div>
      )}
    </Card>
  );
}

function RouteCard({
  routes,
}: {
  routes: Array<{ method: string; path: string }>;
}): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(true);

  // Ensure routes is an array
  const routeArray = Array.isArray(routes) ? routes : [];

  return (
    <Card className="py-2 px-4 flex flex-col gap-2 transition-opacity duration-200 shadow-sm rounded-lg">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Available Routes</span>
          <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
            {routeArray.length} {routeArray.length === 1 ? "route" : "routes"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
          >
            {isExpanded ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="flex flex-col gap-1 mt-1">
          {routeArray.map((route, index) => (
            <Link
              key={`${route.method}-${route.path}-${index}`}
              to="/"
              search={{ method: route.method, uri: route.path }}
              className="text-muted-foreground hover:text-foreground transition-opacity duration-200 flex items-center gap-2 py-1.5 px-2  hover:bg-muted/50 rounded-sm"
            >
              <Method className="text-sm" method={route.method} />
              <span className="font-mono text-sm">{route.path}</span>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}

function RequestCard({
  method,
  path,
  status = "pending",
  state,
  result,
}: {
  method: string;
  path: string;
  status?: "pending" | "success" | "error";
  state?: "partial-call" | "call" | "result";
  result?: { status?: number; body?: string; error?: string; requestStatus?: string };
}): JSX.Element {
  const statusConfig = {
    pending: {
      icon: Clock,
      className: "text-warning bg-warning/15",
    },
    success: {
      icon: CheckCircle2,
      className: "text-success bg-success/15",
    },
    error: {
      icon: XCircle,
      className: "text-danger bg-danger/15",
    },
  };

  // Define the valid status types
  type StatusType = keyof typeof statusConfig;

  // Determine the actual status to display
  // If we have a result with requestStatus, use that
  // Otherwise, fall back to the status prop
  // Ensure it's a valid status type
  const displayStatus: StatusType = 
    (result?.requestStatus as StatusType) || 
    status || 
    "pending";
  
  const StatusIcon = statusConfig[displayStatus].icon;
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card
      className={
        "py-2 px-4 flex flex-col gap-2 transition-opacity duration-200 shadow-sm rounded-lg"
      }
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Method className="text-sm" method={method} />
          <span className="font-mono text-sm">{path}</span>
          <Link
            to="/"
            search={{ method, uri: path }}
            className={
              "text-muted-foreground hover:text-foreground transition-opacity duration-200"
            }
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={cn(
              "rounded-md px-2 py-1 flex items-center gap-1.5 cursor-pointer",
              statusConfig[displayStatus].className
            )}
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
          >
            <StatusIcon className="h-4 w-4" />
            <span className="text-xs font-medium">
              {displayStatus === "success" && result?.status
                ? `${result.status}`
                : displayStatus}
            </span>
          </button>
        </div>
      </div>

      {isExpanded && state === "result" && result && (
        <div className="mt-2 border-t pt-2">
          {result.error ? (
            <div className="text-danger text-sm">
              <p className="font-medium">Error:</p>
              <p className="font-mono text-xs">{result.error}</p>
            </div>
          ) : (
            <>
              {result.status && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium">Status:</span>
                  <span className="text-xs font-mono">{result.status}</span>
                </div>
              )}
              {result.body && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium">Response:</span>
                  <pre className="bg-muted p-2 rounded-md text-xs font-mono overflow-auto max-h-40">
                    {(() => {
                      try {
                        return JSON.stringify(JSON.parse(result.body), null, 2);
                      } catch {
                        return result.body;
                      }
                    })()}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Card>
  );
}

const markdownComponents: Components = {
  ul: ({ children, ...props }) => (
    <ul className="list-disc ml-6 my-2" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="list-decimal ml-6 my-2" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="mb-1" {...props}>
      {children}
    </li>
  ),
  pre: ({ children, ...props }) => (
    <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs" {...props}>
      {children}
    </pre>
  ),
  code: ({ children, className, ...props }) => {
    const match = /language-(\w+)/.exec(className || "");
    return match ? (
      <code className={className} {...props}>
        {children}
      </code>
    ) : (
      <code className="bg-muted px-1 py-0.5 rounded text-sm" {...props}>
        {children}
      </code>
    );
  },
};

function ChatHistory({
  messages,
  isLoading,
  error,
  onRetry,
}: ChatHistoryProps): JSX.Element {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const latestMessageRef = useRef<HTMLDivElement>(null);

  // Scroll to latest message when messages change or when streaming
  // biome-ignore lint/correctness/useExhaustiveDependencies: we want to scroll when messages change or when streaming
  useEffect(() => {
    if (latestMessageRef.current) {
      latestMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const shouldShowResponseDiv =
    messages.length > 0 &&
    messages[messages.length - 1].role === "user" &&
    error === undefined;

  const isLastMessage = (index: number): boolean => {
    if (error || shouldShowResponseDiv) {
      return false;
    }
    return index === messages.length - 1;
  };

  return (
    <ScrollArea className="w-full" ref={scrollAreaRef}>
      <div className="mx-auto max-w-3xl">
        <div className="grid gap-4 p-4">
          {messages.map((message: Message, index) => (
            <div
              key={message.id}
              ref={index === messages.length - 1 ? latestMessageRef : null}
              className={
                // NOTE: we want the last element on the page to take up most of the screen height
                // this moves the previous conversation out of view and makes the experience cleaner
                isLastMessage(index) ? "min-h-[calc(100vh-20rem)]" : ""
              }
            >
              {message.role === "user" ? (
                <Card className="px-4 py-3 rounded-lg shadow-sm">
                  <div className="text-sm whitespace-pre-wrap font-medium">
                    {message.content}
                  </div>
                </Card>
              ) : (
                <div className="space-y-2">
                  {message.parts?.map((part, idx) => {
                    if (part.type === "text") {
                      return (
                        <div key={idx} className="p-2">
                          <div className="prose prose-sm dark:prose-invert max-w-none text-sm grid gap-1">
                            <ReactMarkdown components={markdownComponents}>
                              {part.text}
                            </ReactMarkdown>
                          </div>
                        </div>
                      );
                    }

                    if (part.type === "tool-invocation") {
                      if (
                        part.toolInvocation.toolName === "request" &&
                        part.toolInvocation.state === "result"
                      ) {
                        // Get the status from the result if available, otherwise use the args status
                        // Ensure it's a valid status type
                        const requestStatus = 
                          (part.toolInvocation.result?.requestStatus === "success" || 
                           part.toolInvocation.result?.requestStatus === "error" || 
                           part.toolInvocation.result?.requestStatus === "pending")
                            ? part.toolInvocation.result.requestStatus
                            : (part.toolInvocation.args.status === "success" || 
                               part.toolInvocation.args.status === "error" || 
                               part.toolInvocation.args.status === "pending")
                              ? part.toolInvocation.args.status
                              : "pending";
                        
                        return (
                          <RequestCard
                            key={idx}
                            method={part.toolInvocation.args.method}
                            path={part.toolInvocation.args.path}
                            status={requestStatus}
                            state={part.toolInvocation.state}
                            result={
                              part.toolInvocation.state === "result"
                                ? part.toolInvocation.result
                                : undefined
                            }
                          />
                        );
                      }

                      if (
                        part.toolInvocation.toolName === "route" &&
                        part.toolInvocation.state === "result"
                      ) {
                        const { routes } = part.toolInvocation.args;
                        return <RouteCard key={idx} routes={routes} />;
                      }
                    }

                    return null;
                  })}
                </div>
              )}
            </div>
          ))}

          {error && (
            <div ref={latestMessageRef} className="min-h-[calc(100vh-20rem)]">
              <ErrorCard error={error} onRetry={onRetry} />
            </div>
          )}

          {shouldShowResponseDiv && (
            <div
              className="min-h-[calc(100vh-20rem)] p-2"
              ref={latestMessageRef}
            >
              <div className="prose prose-sm dark:prose-invert max-w-none text-sm grid gap-1">
                {isLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="animate-pulse">
                      <Clock className="h-4 w-4" />
                    </div>
                    <span>...</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

function ChatInput({
  input,
  isLoading,
  onSubmit,
  onInputChange,
}: ChatInputProps): JSX.Element {
  return (
    <div className="w-full">
      <div className="mx-auto max-w-3xl p-4">
        <form onSubmit={onSubmit} className="relative">
          <Textarea
            value={input}
            onChange={onInputChange}
            placeholder="Ask about routes, issue requests, chat with your API"
            disabled={isLoading}
            className="min-h-[80px] pr-12 resize-none bg-input"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                const form = e.currentTarget.form;
                if (form) {
                  form.requestSubmit();
                }
              }
            }}
          />
          <Button
            type="submit"
            disabled={isLoading}
            size="icon"
            className="absolute bottom-2 right-2"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

// Define the request tool parameters type
interface RequestToolParams {
  method: string;
  path: string;
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
  status?: "pending" | "success" | "error";
}

// Define the route tool parameters type
interface RouteToolParams {
  routes: Array<{
    method: string;
    path: string;
  }>;
}

export const Route = createFileRoute("/chat")({
  component: RouteComponent,
});

function RouteComponent() {
  // Use the existing request mutation
  const makeRequestMutation = useMakePlaygroundRequest();
  const { addServiceUrlIfBarePath } = useServiceBaseUrl();
  
  // Add a state to track pending requests
  const [pendingRequests, setPendingRequests] = useState<Record<string, string>>({});

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
  } = useChat({
    api: "/api/chat",
    maxSteps: 5,
    onToolCall: async ({ toolCall }) => {
      console.log("Tool call received:", toolCall);

      // Handle request tool
      if (toolCall.toolName === "request") {
        const params = toolCall.args as RequestToolParams;
        const { method, path, headers, body } = params;
        
        // Create a unique request ID to track this specific request
        const requestId = `${method}-${path}-${Date.now()}`;
        
        // Set initial status to pending
        setPendingRequests(prev => ({
          ...prev,
          [requestId]: "pending"
        }));

        try {
          // Convert headers to the format expected by the playground
          const formattedHeaders: KeyValueElement[] = headers
            ? Object.entries(headers).map(([key, value], index) => ({
                id: `header-${index}`,
                key,
                enabled: true,
                data: {
                  type: "string" as const,
                  value,
                },
                parameter: {
                  name: key,
                  in: "header",
                },
              }))
            : [];

          // Convert body to the format expected by the playground
          const formattedBody: PlaygroundBody = body
            ? {
                type: "json" as const,
                value: JSON.stringify(body),
              }
            : {
                type: "json" as const,
                value: "",
              };

          // Use the existing mutation to make the request
          return new Promise((resolve) => {
            makeRequestMutation.mutate(
              {
                addServiceUrlIfBarePath,
                path,
                method,
                body: formattedBody,
                headers: formattedHeaders,
                pathParams: [],
                queryParams: [],
              },
              {
                onSuccess: (data) => {
                  console.log("Request success:", data);
                  
                  // Update status to success
                  setPendingRequests(prev => ({
                    ...prev,
                    [requestId]: "success"
                  }));

                  // Format the response for the AI in a simple way
                  // that avoids type issues
                  const responseBody = (() => {
                    if (!data.responseBody) {
                      return data.responseStatusCode;
                    }
                    
                    if (data.responseBody.type === "json" && 'value' in data.responseBody) {
                      return data.responseBody.value;
                    }
                    
                    if (data.responseBody.type === "text" && 'value' in data.responseBody) {
                      return data.responseBody.value;
                    }
                    
                    if (data.responseBody.type === "html" && 'value' in data.responseBody) {
                      return data.responseBody.value;
                    }
                    
                    return data.responseStatusCode;
                  })();
                  
                  resolve({
                    status: Number.parseInt(data.responseStatusCode, 10),
                    body: responseBody,
                    requestStatus: "success",
                  });
                },
                onError: (error) => {
                  console.error("Request error:", error);
                  
                  // Update status to error
                  setPendingRequests(prev => ({
                    ...prev,
                    [requestId]: "error"
                  }));
                  
                  // Check if this is the "no active route" error
                  const errorMessage = error instanceof Error ? error.message : String(error);
                  const isNoActiveRouteError = errorMessage.includes("no active route");
                  
                  if (isNoActiveRouteError) {
                    // For this specific error, we can still return a successful response
                    // since the request likely succeeded but we just couldn't update the UI
                    console.log("Handling 'no active route' error gracefully");
                    
                    // Create simple headers object from the formatted headers
                    const simpleHeaders: Record<string, string> = {};
                    for (const header of formattedHeaders) {
                      if (header.enabled && header.data.type === "string") {
                        simpleHeaders[header.key] = header.data.value;
                      }
                    }
                    
                    // Make a direct fetch request to get the response
                    fetch(addServiceUrlIfBarePath(path), {
                      method,
                      headers: simpleHeaders,
                      body: method === "GET" || method === "HEAD" ? undefined : formattedBody.value,
                    })
                      .then(async (response) => {
                        try {
                          const text = await response.text();
                          let responseText: string;
                          try {
                            // Try to parse as JSON for pretty display
                            responseText = JSON.stringify(JSON.parse(text), null, 2);
                          } catch {
                            responseText = text;
                          }
                          
                          resolve({
                            status: response.status,
                            body: responseText,
                            requestStatus: "success",
                          });
                        } catch (fetchError: unknown) {
                          resolve({
                            error: `Error fetching response: ${String(fetchError)}`,
                            requestStatus: "error",
                          });
                        }
                      })
                      .catch((fetchError: unknown) => {
                        resolve({
                          error: `Error making request: ${String(fetchError)}`,
                          requestStatus: "error",
                        });
                      });
                  } else {
                    // For other errors, just return the error message
                    resolve({
                      error: errorMessage,
                      requestStatus: "error",
                    });
                  }
                },
              }
            );
          });
        } catch (error) {
          // Handle unexpected errors
          const errorMessage = error instanceof Error ? error.message : String(error);
          
          // Update status to error
          setPendingRequests(prev => ({
            ...prev,
            [requestId]: "error"
          }));
          
          return { 
            error: errorMessage,
            requestStatus: "error",
          };
        }
      }

      // Handle route tool - just return the routes directly
      if (toolCall.toolName === "route") {
        const args = toolCall.args;

        // If args is an array, wrap it in the expected object structure
        if (Array.isArray(args)) {
          return { routes: args };
        }

        // If args is an object with a routes property, return as is
        if (
          args &&
          typeof args === "object" &&
          "routes" in args &&
          Array.isArray(args.routes)
        ) {
          return args as RouteToolParams;
        }

        // Fallback to empty routes array
        return { routes: [] };
      }

      // For other tools, return undefined
      return undefined;
    },
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });

  return (
    <Layout>
      <div className="grid h-full grid-rows-[1fr,auto]">
        <ChatHistory
          messages={messages}
          isLoading={isLoading}
          error={error}
          onRetry={reload}
        />
        <ChatInput
          input={input}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          onInputChange={handleInputChange}
        />
      </div>
    </Layout>
  );
}
