import type { z } from "zod";
import type { FetchFn } from "../types";

export class BaseService {
  protected apiKey: string;
  protected baseUrl: string;
  protected fetch: FetchFn;

  constructor(apiKey: string, baseUrl: string, fetch: FetchFn) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.fetch = fetch;
  }

  protected async request<ResponseSchema>(
    schema: z.ZodType<ResponseSchema>,
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ResponseSchema> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    };

    const response = await this.fetch(url, { ...options, headers });
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const json = await response.json();
    return schema.parse(json);
  }
}
