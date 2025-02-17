import { z } from "zod";
import { BaseService } from "./base.js";
const CreateTokenResponseSchema = z.object({ token: z.string() });
const VerifyTokenResponseSchema = z.object({ valid: z.boolean() });
const RevokeTokenResponseSchema = z.object({ success: z.boolean() });
export class TokenService extends BaseService {
    async createToken(metadata) {
        return this.request(CreateTokenResponseSchema, "/tokens", {
            method: "PUT",
            body: JSON.stringify({ metadata }),
        });
    }
    async verifyToken(token) {
        return this.request(VerifyTokenResponseSchema, "/tokens/verify", {
            method: "POST",
            body: JSON.stringify({ token }),
        });
    }
    async revokeToken(token) {
        return this.request(RevokeTokenResponseSchema, `/tokens/revoke/${token}`, {
            method: "DELETE",
        });
    }
}
