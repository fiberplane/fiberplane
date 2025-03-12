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
  result?: { status?: number; body?: string; error?: string };
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

  const StatusIcon = statusConfig[status].icon;
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
              statusConfig[status].className
            )}
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
          >
            <StatusIcon className="h-4 w-4" />
            <span className="text-xs font-medium">
              {status === "success" && result?.status
                ? `${result.status}`
                : status}
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
                      if (part.toolInvocation.toolName === "request") {
                        return (
                          <RequestCard
                            key={idx}
                            method={part.toolInvocation.args.method}
                            path={part.toolInvocation.args.path}
                            status={part.toolInvocation.args.status}
                            state={part.toolInvocation.state}
                            result={
                              part.toolInvocation.state === "result"
                                ? part.toolInvocation.result
                                : undefined
                            }
                          />
                        );
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

export const Route = createFileRoute("/chat")({
  component: RouteComponent,
});

function RouteComponent() {
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
    onToolCall: ({ toolCall }) => {
      console.log("Tool call received:", toolCall);
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
