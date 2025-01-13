import { TokenService } from "./tokens.js";
export class FpService {
    tokens;
    constructor({ apiKey, baseUrl = "http://localhost:1234/api", }) {
        this.tokens = new TokenService(apiKey, baseUrl);
    }
}
