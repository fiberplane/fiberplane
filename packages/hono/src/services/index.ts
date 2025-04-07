import type { z } from "zod";
import type { FetchFn } from "../types";
import { TokenService } from "./tokens";

interface FpServiceOptions {
  apiKey: string;
  baseUrl?: string;
  fetch: FetchFn;
}

export class FpService {
  readonly tokens: TokenService;

  constructor({
    apiKey,
    baseUrl = "http://localhost:7676/api",
    fetch,
  }: FpServiceOptions) {
    this.tokens = new TokenService(apiKey, baseUrl, fetch);
  }
}
