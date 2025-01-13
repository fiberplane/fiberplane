import { BaseService } from "./base.js";
export declare class TokenService extends BaseService {
    createToken(metadata: string): Promise<{
        token: string;
    }>;
    verifyToken(token: string): Promise<{
        valid: boolean;
    }>;
    revokeToken(token: string): Promise<{
        success: boolean;
    }>;
}
