import type { z } from "zod";
export declare class BaseService {
    protected apiKey: string;
    protected baseUrl: string;
    constructor(apiKey: string, baseUrl: string);
    protected request<ResponseSchema>(schema: z.ZodType<ResponseSchema>, endpoint: string, options?: RequestInit): Promise<ResponseSchema>;
}
