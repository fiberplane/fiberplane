import { z } from "zod";

// NOTE - gpt-3.5-turbo was not working with our current prompting logic
//        We would get this error: https://community.openai.com/t/error-code-400-for-repetitive-prompt-patterns/627157/7
//        It seems to have to do with the prompt data we inject? IDK.

export const GPT_4o = "gpt-4o";
export const GPT_4o_MINI = "gpt-4o-mini";
export const GPT_4_TURBO = "gpt-4-turbo";

const OpenAiModelSchema = z.union([
  z.literal(GPT_4o),
  z.literal(GPT_4o_MINI),
  z.literal(GPT_4_TURBO),
]);

type OpenAiModel = z.infer<typeof OpenAiModelSchema>;

export const isValidOpenaiModel = (value: string): value is OpenAiModel =>
  OpenAiModelSchema.safeParse(value).success;

export const OpenAiModelOptions = {
  [GPT_4o]: "GPT-4o",
  [GPT_4o_MINI]: "GPT-4o Mini",
  [GPT_4_TURBO]: "GPT-4 Turbo",
} as const;

export const CLAUDE_3_5_SONNET = "claude-3-5-sonnet-20240620";
export const CLAUDE_3_OPUS = "claude-3-opus-20240229";
export const CLAUDE_3_SONNET = "claude-3-sonnet-20240229";
export const CLAUDE_3_HAIKU = "claude-3-haiku-20240307";

const AnthropicModelSchema = z.union([
  z.literal(CLAUDE_3_5_SONNET),
  z.literal(CLAUDE_3_OPUS),
  z.literal(CLAUDE_3_SONNET),
  z.literal(CLAUDE_3_HAIKU),
]);

type AnthropicModel = z.infer<typeof AnthropicModelSchema>;

export const isValidAnthropicModel = (value: string): value is AnthropicModel =>
  AnthropicModelSchema.safeParse(value).success;

export const AnthropicModelOptions = {
  [CLAUDE_3_5_SONNET]: "Claude 3.5 Sonnet",
  [CLAUDE_3_OPUS]: "Claude 3 Opus",
  [CLAUDE_3_SONNET]: "Claude 3 Sonnet",
  [CLAUDE_3_HAIKU]: "Claude 3 Haiku",
} as const;

const ProviderTypeSchema = z.union([
  z.literal("openai"),
  z.literal("anthropic"),
]);

type Provider = z.infer<typeof ProviderTypeSchema>;

export const isValidProvider = (value?: string): value is Provider =>
  ProviderTypeSchema.safeParse(value).success;

export const ProviderOptions = {
  openai: "OpenAI",
  anthropic: "Anthropic",
} as const;

export const FormSchema = z.object({
  customRoutesEnabled: z.boolean().optional(),
  aiEnabled: z.boolean().optional(),
  aiProviderType: ProviderTypeSchema.optional(),
  openaiApiKey: z.string().optional(),
  openaiBaseUrl: z.string().optional(),
  openaiModel: OpenAiModelSchema.optional(),
  anthropicApiKey: z.string().optional(),
  anthropicBaseUrl: z.string().optional(),
  anthropicModel: AnthropicModelSchema.optional(),
  proxyRequestsEnabled: z.boolean().optional(),
  proxyBaseUrl: z.string().optional(),
});
