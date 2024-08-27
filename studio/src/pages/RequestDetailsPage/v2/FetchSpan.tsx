import { Status } from "@/components/ui/status";
import { CodeMirrorSqlEditor } from "@/pages/RequestorPage/Editors/CodeMirrorEditor";
import { getHttpMethodTextColor } from "@/pages/RequestorPage/method";
import type { OtelSpan } from "@/queries";
import { SENSITIVE_HEADERS, cn, noop } from "@/utils";
import { ClockIcon } from "@radix-ui/react-icons";
import { useMemo } from "react";
import { format } from "sql-formatter";
import { TextOrJsonViewer } from "../TextJsonViewer";
import { SectionHeading } from "../shared";
import { CollapsibleKeyValueTableV2 } from "./KeyValueTableV2";
import {
  getRequestBody,
  getRequestHeaders,
  getRequestMethod,
  getRequestUrl,
  getResponseBody,
  getResponseHeaders,
  getStatusCode,
} from "./otel-helpers";
import { Divider, SubSection, SubSectionHeading } from "./shared";
import {
  type NeonVendorInfo,
  type VendorInfo,
  isAnthropicVendorInfo,
  isNeonVendorInfo,
  isOpenAIVendorInfo,
} from "./vendorify-traces";

export function FetchSpan({
  span,
  vendorInfo,
}: { span: OtelSpan; vendorInfo: VendorInfo }) {
  const id = span.span_id;

  const method = getRequestMethod(span);

  const requestHeaders = useMemo<Record<string, string>>(() => {
    return getRequestHeaders(span);
  }, [span]);

  const requestBody = useMemo<string>(() => {
    return getRequestBody(span) ?? "";
  }, [span]);

  const responseHeaders = useMemo<Record<string, string>>(() => {
    return getResponseHeaders(span);
  }, [span]);

  const responseBody = useMemo<string>(() => {
    return getResponseBody(span) ?? "";
  }, [span]);

  const duration = useMemo(() => {
    try {
      const duration =
        new Date(span.end_time).getTime() - new Date(span.start_time).getTime();
      return duration;
    } catch (e) {
      return null;
    }
  }, [span]);

  const url = getRequestUrl(span);

  const { component, title } = useVendorSpecificSection(vendorInfo) ?? {};

  return (
    <GenericFetchSpan
      id={id}
      title={title}
      statusCode={getStatusCode(span)}
      duration={duration}
      method={method}
      url={url}
      requestHeaders={requestHeaders}
      requestBody={requestBody}
      responseHeaders={responseHeaders}
      responseBody={responseBody}
    >
      {component}
    </GenericFetchSpan>
  );
}

type GenericFetchSpanProps = {
  id: string;
  title?: string;
  statusCode: number;
  duration: number | null;
  method: string;
  url: string;
  requestHeaders: Record<string, string>;
  requestBody?: string;
  responseHeaders: Record<string, string>;
  responseBody?: string;
  children?: React.ReactNode;
};

function GenericFetchSpan({
  id,
  title,
  statusCode,
  duration,
  method,
  url,
  requestHeaders,
  requestBody,
  responseHeaders,
  responseBody,
  children,
}: GenericFetchSpanProps) {
  return (
    <div id={id}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 my-4">
          <SectionHeading>{title || "Fetch"}</SectionHeading>
          <div className="flex gap-2">
            <div className="inline-flex gap-2 font-mono py-1 px-2 text-xs bg-accent/80 rounded">
              <span className={cn("uppercase", getHttpMethodTextColor(method))}>
                {method}
              </span>
              {url}
            </div>
            <div className="inline-flex gap-2 font-mono text-gray-400 py-1 px-2 text-xs bg-accent/80 rounded">
              <ClockIcon className="w-4 h-4" />
              <span className=" font-light">{duration}ms</span>
            </div>
            {statusCode !== undefined && <Status statusCode={statusCode} />}
          </div>
        </div>

        {children}

        <SubSection>
          <CollapsibleKeyValueTableV2
            keyValue={requestHeaders}
            title="Request Headers"
            sensitiveKeys={SENSITIVE_HEADERS}
          />
        </SubSection>

        {requestBody && (
          <>
            <Divider />
            <SubSection>
              <SubSectionHeading>Request Body</SubSectionHeading>
              <TextOrJsonViewer text={requestBody} textMaxPreviewLines={15} />
            </SubSection>
          </>
        )}

        <Divider />

        <SubSection>
          <CollapsibleKeyValueTableV2
            keyValue={responseHeaders}
            title="Response Headers"
            sensitiveKeys={SENSITIVE_HEADERS}
          />
        </SubSection>

        {responseBody && (
          <>
            <Divider />
            <SubSection>
              <SubSectionHeading>Response Body</SubSectionHeading>
              <TextOrJsonViewer text={responseBody} textMaxPreviewLines={15} />
            </SubSection>
          </>
        )}
      </div>
    </div>
  );
}

const DEFAULT_VENDOR_RESULT = {
  component: undefined,
  title: undefined,
};

/**
 * Returns a component and title for a vendor-specific span.
 * @param span The span to render.
 * @returns A component and title for a vendor-specific section of the span.
 */
function useVendorSpecificSection(vendorInfo: VendorInfo) {
  return useMemo(() => {
    // const vendorInfo =
    if (isNeonVendorInfo(vendorInfo)) {
      return {
        component: <NeonSection vendorInfo={vendorInfo} />,
        title: "Neon Database Call",
      };
    }
    if (isOpenAIVendorInfo(vendorInfo)) {
      return {
        component: undefined,
        title: "OpenAI API Call",
      };
    }
    if (isAnthropicVendorInfo(vendorInfo)) {
      return {
        component: undefined,
        title: "Anthropic API Call",
      };
    }
    return DEFAULT_VENDOR_RESULT;
  }, [vendorInfo]);
}

function NeonSection({ vendorInfo }: { vendorInfo: NeonVendorInfo }) {
  const queryValue = useMemo(() => {
    try {
      const paramsFromNeon = vendorInfo.sql.params ?? [];
      // NOTE - sql-formatter expects the index in the array to match the `$nr` syntax from postgres
      //        this makes the 0th index unused, but it makes the rest of the indices match the `$1`, `$2`, etc.
      const params = ["", ...paramsFromNeon];
      return format(vendorInfo.sql.query, {
        language: "postgresql",
        params,
      });
    } catch (e) {
      // Being very defensive soz
      return vendorInfo?.sql?.query ?? "";
    }
  }, [vendorInfo]);
  return (
    <SubSection>
      <SubSectionHeading>SQL Query</SubSectionHeading>
      <CodeMirrorSqlEditor value={queryValue} onChange={noop} readOnly={true} />
    </SubSection>
  );
}
