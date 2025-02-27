import type { z } from "zod";
import type { FetchFn } from "../types.js";
import { TokenService } from "./tokens.js";

interface FpServiceOptions {
  apiKey: string;
  baseUrl?: string;
  fetch: FetchFn;
}

export class FpService {
  readonly tokens: TokenService;

  constructor({
    apiKey,
    baseUrl = "http://localhost:1234/api",
    fetch,
  }: FpServiceOptions) {
    this.tokens = new TokenService(apiKey, baseUrl, fetch);
  }
}
