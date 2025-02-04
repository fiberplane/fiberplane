import { Method } from "@/components/Method";
import { StatusCode } from "@/components/StatusCode";
import { cn, parsePathFromRequestUrl } from "@/utils";
import type { ProxiedRequestResponse } from "../queries";
import {
  type RequestorActiveResponse,
  isRequestorActiveResponse,
} from "../store/types";

export function ResponseSummary({
  response,
  transformUrl = (url: string) => url,
}: {
  response?: ProxiedRequestResponse | RequestorActiveResponse;
  transformUrl?: (url: string) => string;
}) {
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
    <div className="flex items-center space-x-2 text-sm">
      <StatusCode status={status ?? "—"} isFailure={!status} />
      <div>
        <Method method={method ?? "—"} />
        <span
          className={cn(
            "font-mono",
            "whitespace-nowrap",
            "overflow-ellipsis",
            "text-xs",
            "ml-2",
            "pt-0.5", // HACK - to adjust baseline of mono font to look good next to sans
          )}
        >
          {transformUrl ? transformUrl(url ?? "") : url}
        </span>
      </div>
    </div>
  );
}
