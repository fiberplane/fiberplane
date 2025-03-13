import { type ExportResult, ExportResultCode } from "@opentelemetry/core";
import {
  type ExportServiceError,
  OTLPExporterError,
} from "@opentelemetry/otlp-exporter-base";
import { createExportTraceServiceRequest } from "@opentelemetry/otlp-transformer";
import type { ReadableSpan, SpanExporter } from "@opentelemetry/sdk-trace-base";
import type { FpxLogger } from "./logger";
import type { PromiseStore } from "./promiseStore";
import type { FetchFn } from "./types";
import { isWrapped } from "./utils";

interface OTLPExporterConfig {
  url: string;
  headers?: Record<string, string>;
}

const defaultHeaders: Record<string, string> = {
  // INVESTIGATE - add user agent in the same way the OTLPTraceExporter does
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
 *
 *         Solution inspired by https://github.com/evanderkoogh/otel-cf-workers/blob/450435bc136d5b81aee655096aa4b8261f42d0c7/src/exporter.ts
 */
export class FPOTLPExporter implements SpanExporter {
  private headers: Record<string, string>;
  private url: string;
  private fetchFn: FetchFn;
  private logger: FpxLogger;
  private promiseStore: PromiseStore;

  constructor(
    config: OTLPExporterConfig,
    fetchFn: FetchFn,
    promiseStore: PromiseStore,
    logger: FpxLogger,
  ) {
    this.url = config.url;
    this.headers = Object.assign({}, defaultHeaders, config.headers);
    this.fetchFn = fetchFn;
    this.promiseStore = promiseStore;
    this.logger = logger;

    if (isWrapped(this.fetchFn)) {
      this.logger.error(
        "FPOTLPExporter's fetch function is already instrumented, so we cannot send traces without causing an infinite loop",
      );
      throw new Error("FPOTLPExporter fetchFn cannot be instrumented");
    }
  }

  export(
    items: Array<ReadableSpan>,
    resultCallback: (result: ExportResult) => void,
  ): void {
    this._export(items)
      .then(() => {
        this.logger.debug("Successfully exported spans");
        resultCallback({ code: ExportResultCode.SUCCESS });
      })
      .catch((error: ExportServiceError) => {
        this.logger.error("Error exporting spans", { error });
        resultCallback({ code: ExportResultCode.FAILED, error });
      });
  }

  private _export(items: Array<ReadableSpan>): Promise<unknown> {
    return new Promise<void>((resolve, reject) => {
      try {
        this.send(items, resolve, reject);
      } catch (e) {
        reject(e);
      }
    });
  }

  send(
    items: Array<ReadableSpan>,
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

    // NOTE - You can log the payload to the console for debugging purposes
    this.logger.debug(`Sending payload to OTLP (${this.url})`, params);

    const fetchPromise = this.fetchFn(this.url, params)
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

    this.promiseStore.add(fetchPromise);
  }

  async shutdown(): Promise<void> {}
}
