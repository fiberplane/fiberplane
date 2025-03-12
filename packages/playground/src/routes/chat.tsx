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
import { useRef, useEffect } from "react";
import { Send, ExternalLink, CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/utils";
import { Method } from "@/components/Method";

interface ChatHistoryProps {
  messages: Message[];
  isLoading: boolean;
}

function RequestCard({
  method,
  path,
  status = "pending",
  state,
}: {
  method: string;
  path: string;
  status?: "pending" | "success" | "error";
  state?: "partial-call" | "call" | "result";
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

  return (
    <Card
      className={
        "py-2 px-4 flex items-center justify-between gap-4 transition-opacity duration-200 shadow-sm rounded-lg"
      }
    >
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
        <div
          className={cn(
            "rounded-md px-2 py-1 flex items-center gap-1.5",
            statusConfig[status].className
          )}
        >
          <StatusIcon className="h-4 w-4" />
        </div>
      </div>
    </Card>
  );
}

const markdownComponents: Components = {
  li: ({ children, ...props }) => (
    <li className="list-disc list-inside" {...props}>
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

function ChatHistory({ messages, isLoading }: ChatHistoryProps): JSX.Element {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const latestMessageRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: we want to scroll to latest message when messages change
  useEffect(() => {
    if (latestMessageRef.current) {
      latestMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const shouldShowResponseDiv =
    messages.length > 0 && messages[messages.length - 1].role === "user";

  return (
    <ScrollArea className="w-full" ref={scrollAreaRef}>
      <div className="mx-auto max-w-3xl">
        <div className="grid gap-4 p-4">
          {messages.map((message: Message, index) => {
            return (
              <div
                key={message.id}
                ref={index === messages.length - 1 ? latestMessageRef : null}
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
                            />
                          );
                        }
                      }

                      return null;
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {shouldShowResponseDiv && (
            <div className="min-h-[calc(100vh-20rem)] p-2">
              <div className="prose prose-sm dark:prose-invert max-w-none text-sm grid gap-1">
                {isLoading ? "..." : ""}
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
  const initialMessages: Message[] = [
    {
      id: "user-1",
      role: "user",
      content: "Show me the users API endpoints"
    },
    {
      id: "assistant-1",
      role: "assistant",
      content: "Here are the available user endpoints:",
      parts: [
        {
          type: "text",
          text: "The API provides the following endpoints for user management:\n\n- `GET /api/users` - List all users\n- `POST /api/users` - Create a new user\n- `GET /api/users/:id` - Get user details\n- `PUT /api/users/:id` - Update a user\n- `DELETE /api/users/:id` - Delete a user"
        }
      ]
    },
    {
      id: "user-2",
      role: "user",
      content: "Get the list of users"
    },
    {
      id: "assistant-2",
      role: "assistant",
      content: "I'll fetch the list of users for you.",
      parts: [
        {
          type: "text",
          text: "Executing GET request to fetch all users..."
        },
        {
          type: "tool-invocation",
          toolInvocation: {
            toolCallId: "tool-1",
            toolName: "request",
            args: {
              method: "GET",
              path: "/api/users",
              status: "success"
            },
            state: "result",
            result: {
              status: 200,
              body: "[]"
            }
          }
        },
        {
          type: "text",
          text: "The response shows an empty array, which means there are no users in the system yet. Would you like to create a new user?"
        }
      ]
    }
  ];

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
  } = useChat({
    api: "/api/chat",
    maxSteps: 5,
    initialMessages
  });

  return (
    <Layout>
      <div className="grid h-full grid-rows-[1fr,auto]">
        <ChatHistory messages={messages} isLoading={isLoading} />
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
