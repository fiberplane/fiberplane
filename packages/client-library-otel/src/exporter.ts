import { type ExportResult, ExportResultCode } from "@opentelemetry/core";
import {
  type ExportServiceError,
  OTLPExporterError,
} from "@opentelemetry/otlp-exporter-base";
import { createExportTraceServiceRequest } from "@opentelemetry/otlp-transformer";
import type { SpanExporter } from "@opentelemetry/sdk-trace-base";
import { getLogger } from "./logger";
import { isWrapped } from "./utils";
// Freeze the web standard fetch function so that we can use it below without being affected by monkeypatching
const webStandardFetch = fetch;

export interface OTLPExporterConfig {
  url: string;
  headers?: Record<string, string>;
}

const defaultHeaders: Record<string, string> = {
  // TODO - add user agent in the same way the OTLPTraceExporter does
  accept: "application/json",
  "content-type": "application/json",
};

/**
 * @NOTE - We had to implement a custom SpanExporter because the OTLPTraceExporter
 *         was not working for us in Cloudflare Workers.
 *
 *         Specifically, the OTLPTraceExporter kept thinking that we were in the browser,
 *         _but only when we attached a `headers` object to the request._
 *
 *         The lack of browser APIs (XHR, sendBeacon) led to runtime errors.
 */
export class FPOTLPExporter implements SpanExporter {
  private headers: Record<string, string>;
  private url: string;
  constructor(config: OTLPExporterConfig) {
    this.url = config.url;
    this.headers = Object.assign({}, defaultHeaders, config.headers);
  }

  // biome-ignore lint/suspicious/noExplicitAny: items really can be anything
  export(items: any[], resultCallback: (result: ExportResult) => void): void {
    this._export(items)
      .then(() => {
        resultCallback({ code: ExportResultCode.SUCCESS });
      })
      .catch((error: ExportServiceError) => {
        resultCallback({ code: ExportResultCode.FAILED, error });
      });
  }

  // biome-ignore lint/suspicious/noExplicitAny: items really can be anything
  private _export(items: any[]): Promise<unknown> {
    return new Promise<void>((resolve, reject) => {
      try {
        this.send(items, resolve, reject);
      } catch (e) {
        reject(e);
      }
    });
  }

  send(
    // biome-ignore lint/suspicious/noExplicitAny: items really can be anything
    items: any[],
    onSuccess: () => void,
    onError: (error: OTLPExporterError) => void,
  ): void {
    const exportMessage = createExportTraceServiceRequest(
      items,
      /** useHex: */ true,
    );

    // HACK - Convert timestamp fields to strings so that they are not parsed as numbers
    //        This gives us better support in the Fiberplane Rust ingestor
    //
    const body = JSON.stringify(exportMessage, (key, value) => {
      // Convert timestamp fields to strings
      if (
        key === "startTimeUnixNano" ||
        key === "endTimeUnixNano" ||
        key === "timeUnixNano"
      ) {
        return String(value);
      }
      return value;
    });

    const params: RequestInit = {
      method: "POST",
      headers: this.headers,
      body,
    };

    if (isWrapped(webStandardFetch)) {
      getLogger("error").error("Fetch is already wrapped, cannot send traces.");
      throw new Error("Fetch is already wrapped, cannot send traces.");
    }

    webStandardFetch(this.url, params)
      .then(async (response) => {
        if (response.ok) {
          onSuccess();
        } else {
          onError(
            new OTLPExporterError(
              `Exporter received a statusCode: ${response.status}`,
            ),
          );
        }
      })
      .catch((error) => {
        onError(
          new OTLPExporterError(
            `Exception during export: ${error.toString()}`,
            error.code,
            error.stack,
          ),
        );
      });
  }

  async shutdown(): Promise<void> {}
}
