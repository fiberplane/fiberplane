import type { ExecutionError } from "@/lib/api/errors";
import {
  type SupportedParameterObject,
  isSupportedParameterObject,
} from "@/lib/isOpenApi";
import { Route } from "@/routes/workflows.$workflowId";
import type { WorkflowStep } from "@/types";
import { cn, noop } from "@/utils";
import { Link, useNavigate } from "@tanstack/react-router";
import { Link2Icon, Play } from "lucide-react";
import { KeyValueTable } from "../KeyValueTableV2";
import { Method } from "../Method";
import { StatusCode } from "../StatusCode";
import { useRoutes } from "../playground/routes";
import { type KeyValueElement, useStudioStore } from "../playground/store";
import { Button } from "../ui/button";
import { ListSection } from "./ListSection";

export function StepperItem(
  props: Pick<
    WorkflowStep,
    "stepId" | "operation" | "description" | "parameters"
  > & {
    index: number;
    error?: ExecutionError;
  },
) {
  useRoutes();
  const { index, description, operation, stepId, error } = props;

  const { stepId: paramStepId } = Route.useSearch();
  const expanded = paramStepId ? stepId === paramStepId : error;
  const navigate = useNavigate();

  const {
    appRoutes,
    setActiveRoute,
    setCurrentPathParams,
    setCurrentRequestHeaders,
    setCurrentBody,
    setCurrentQueryParams,
  } = useStudioStore(
    "appRoutes",
    "setActiveRoute",
    "setCurrentPathParams",
    "setCurrentRequestHeaders",
    "setCurrentBody",
    "setCurrentQueryParams",
  );

  const request = error?.payload.request;
  const openInPlayground = request
    ? () => {
        console.log("open in playground");
        const route = appRoutes.find(
          (r) =>
            r.method.toLowerCase() === operation.method.toLowerCase() &&
            r.path === operation.path,
        );
        // debugger;
        if (route) {
          console.log("setting active route");
          setActiveRoute(route);
          console.log("call returned");
          if (request.body) {
            // TODO handle other content types
            setCurrentBody({
              type: "json",
              value: request.body,
            });
          }
          const headers = request.headers;
          const headerValues: Array<KeyValueElement> = Object.entries(
            headers,
          ).map(
            ([key, value]): KeyValueElement => ({
              key,
              id: key,
              // value,
              data: {
                value,
                type: "string",
              },
              enabled: true,
              parameter: {
                in: "header",
                name: key,
              },
            }),
          );
          setCurrentRequestHeaders(headerValues);

          // const operation = isSupportedOperationObject(route.operation) ? ;
          const routeParameters: Array<SupportedParameterObject> =
            route.parameters ?? [];
          const operationParameters: Array<SupportedParameterObject> =
            (route.operation.parameters?.filter(isSupportedParameterObject) as
              | undefined
              | Array<SupportedParameterObject>) ?? [];
          const combinedParameters = [
            ...routeParameters,
            ...operationParameters,
          ];

          const pathParams: Array<KeyValueElement> = combinedParameters
            .filter((p) => p.in === "path")
            .map((p) => ({
              key: p.name,
              data: {
                type: "string",
                value: String(error.payload.parameters?.[p.name] || ""),
              },
              enabled: true,
              id: p.name,
              parameter: p,
            }));
          setCurrentPathParams(pathParams);
          const searchParams = combinedParameters
            .filter((p) => p.in === "query")
            .map(
              (p): KeyValueElement => ({
                id: p.name,
                key: p.name,
                enabled: true,
                data: {
                  type: "string",
                  value: String(error.payload.parameters?.[p.name] || ""),
                },
                parameter: p,
              }),
            );
          setCurrentQueryParams(searchParams);
        }
        navigate({
          to: "/",
          search: (params) => ({
            ...params,
            method: operation.method.toUpperCase(),
            uri: operation.path,
          }),
        });
      }
    : noop;

  return (
    <div
      className={cn(
        "block rounded-md relative",
        `before:content-[""] before:absolute before:border-l before:border-l-foreground/10 before:left-[15px] before:z-10`,
        "before:h-[calc(100%)] before:top-8 last:before:hidden",
        {
          "border-danger": !!error,
        },
      )}
    >
      <div>
        <Link
          type="button"
          className={cn(
            "w-full grid grid-cols-[auto_1fr] gap-4 pt-2 pb-2 px-1",
            {
              "hover:bg-muted rounded-md": !expanded,
              "cursor-default": expanded,
            },
            "text-start",
          )}
          to="."
          search={(param) => {
            const newParams = { ...param };
            newParams.stepId = stepId;
            return newParams;
          }}
        >
          <div
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center z-10 relative",
              expanded
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            <span className="">{index + 1}</span>
          </div>
          <div>{description}</div>
        </Link>
        {expanded && (
          <div className="ml-10 pr-2 pb-2 text-sm pl-2 pt-0 grid gap-2">
            <div className="grid gap-2">
              <Link
                className={cn(
                  "grid grid-cols-[auto_auto_1fr] gap-2 items-center",
                  "hover:underline w-full",
                )}
                to="/"
                search={(params) => ({
                  ...params,
                  method: operation.method.toUpperCase(),
                  uri: operation.path,
                })}
              >
                <Method method={operation.method} />
                <span className="font-mono">{operation.path}</span>
                <Link2Icon className="w-3.5" />
              </Link>
            </div>
            {error && (
              <div className="grid gap-2">
                <h4 className="text-sm font-bold text-danger">
                  Failed to execute step
                </h4>
                <div className={cn("grid gap-2")}>
                  {/* <div className="grid gap-2">
                <div>Inputs</div>
                <div className="grid gap-2">
                  {Object.entries(error.details.inputs).map(([name, value]) => <NameValueItem key={name} name={name} value={value} />)}
                </div>
              </div> */}
                  {request && (
                    <div>
                      <ListSection
                        title={
                          <>
                            <span>Request</span>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              className="w-auto px-2"
                              onClick={openInPlayground}
                            >
                              <Play /> playground
                            </Button>
                          </>
                        }
                        titleClassName="py-2 min-h-0 grid grid-cols-[auto_auto] justify-between"
                        contentClassName="grid gap-2"
                      >
                        <div className="grid grid-cols-[auto_1fr] gap-2">
                          <div className="text-muted-foreground">Url:</div>
                          <div>{request.url}</div>
                        </div>
                        <div>
                          Headers
                          <KeyValueTable
                            keyValue={Object.entries(request.headers)}
                          />
                        </div>
                        {request.body && (
                          <div>
                            Body
                            <pre className="max-w-full overflow-auto font-mono">
                              <code>{request.body}</code>
                            </pre>
                          </div>
                        )}
                      </ListSection>
                    </div>
                  )}
                  {error.payload.response?.status && (
                    <ListSection
                      className="border-warning bg-warning/10"
                      title={
                        <div className="grid gap-2 grid-cols-[auto_auto] justify-start">
                          <span>Response</span>
                          <StatusCode
                            status={error.payload.response.status.toString()}
                            isFailure={false}
                          />
                        </div>
                      }
                      titleClassName="border-warning py-2 min-h-0"
                    >
                      <pre className="max-w-full overflow-auto font-mono">
                        <code>{error.payload.response.body}</code>
                      </pre>
                    </ListSection>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
