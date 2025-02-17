import { TokenService } from "./tokens.js";
interface FpServiceOptions {
    apiKey: string;
    baseUrl?: string;
}
export declare class FpService {
    readonly tokens: TokenService;
    constructor({ apiKey, baseUrl, }: FpServiceOptions);
}
export {};
