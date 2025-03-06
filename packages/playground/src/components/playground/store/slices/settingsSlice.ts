import {
  AVAILABLE_FEATURE_FLAGS,
  FEATURE_FLAG_ERROR_REPORTING,
  FEATURE_FLAG_TRACES,
  FEATURE_FLAG_WORKFLOWS,
  type FeatureFlag,
} from "@/constants";
// HACK - Importing this from a separate file from within the root utils dir is a hack to avoid circular dependencies.
import { safeParseJson } from "@/utils/safe-parse-json";
import { z } from "zod";
import type { StateCreator } from "zustand";
import { enforceTerminalDraftParameter } from "../../KeyValueForm";
import type { KeyValueElement } from "../types";
import type { StudioState } from "./types";

const SETTINGS_STORAGE_KEY = "playground_settings";

const AuthorizationBaseSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
});

export const AuthorizationBearerSchema = AuthorizationBaseSchema.extend({
  type: z.literal("bearer"),
  token: z.string(),
});
export type AuthorizationBearer = z.infer<typeof AuthorizationBearerSchema>;

const AuthorizationBasicSchema = AuthorizationBaseSchema.extend({
  type: z.literal("basic"),
  username: z.string(),
  password: z.string(),
});
export type AuthorizationBasic = z.infer<typeof AuthorizationBasicSchema>;

export const AuthorizationSchema = z.union([
  AuthorizationBasicSchema,
  AuthorizationBearerSchema,
]);
export type Authorization = z.infer<typeof AuthorizationSchema>;
const AuthorizationsSchema = z.array(AuthorizationSchema);

const getInitialAuthHeaders = () =>
  enforceTerminalDraftParameter([
    {
      id: crypto.randomUUID(),
      key: "",
      data: {
        type: "string",
        value: "",
      },
      enabled: false,
      parameter: {
        name: "",
        in: "header",
      },
    },
  ]);

const loadSettingsFromStorage = (): {
  persistentAuthHeaders: KeyValueElement[];
  authorizations: Authorization[];
  enabledFeatures: FeatureFlag[];
  isWorkflowsEnabled: boolean;
  isTracingEnabled: boolean;
  shouldShowTopNav: boolean;
  isErrorReportingEnabled: boolean;
  partitionKey: string;
} => {
  const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (!stored) {
    return {
      persistentAuthHeaders: getInitialAuthHeaders(),
      authorizations: [],
      enabledFeatures: [],
      isWorkflowsEnabled: false,
      isTracingEnabled: false,
      isErrorReportingEnabled: false,
      shouldShowTopNav: false,
      partitionKey: "",
    };
  }

  const parsed = safeParseJson(stored);
  if (!parsed) {
    return {
      persistentAuthHeaders: getInitialAuthHeaders(),
      authorizations: [],
      enabledFeatures: [],
      isWorkflowsEnabled: false,
      isTracingEnabled: false,
      isErrorReportingEnabled: false,
      shouldShowTopNav: false,
      partitionKey: "",
    };
  }

  const result = AuthorizationsSchema.safeParse(parsed.authorizations);
  const authorizations = result.success ? result.data : [];
  const enabledFeatures = Array.isArray(parsed.enabledFeatures)
    ? parsed.enabledFeatures.filter((f: string) =>
        AVAILABLE_FEATURE_FLAGS.includes(f as FeatureFlag),
      )
    : [];

  // Compute the derived states
  const isWorkflowsEnabled = enabledFeatures.includes(FEATURE_FLAG_WORKFLOWS);
  const isTracingEnabled = enabledFeatures.includes(FEATURE_FLAG_TRACES);
  const shouldShowTopNav = isWorkflowsEnabled || isTracingEnabled;
  const isErrorReportingEnabled = enabledFeatures.includes(
    FEATURE_FLAG_ERROR_REPORTING,
  );
  const persistentAuthHeaders = (parsed.persistentAuthHeaders || []).filter(
    (element: Record<string, unknown>) => {
      "parameter" in element && "data" in element;
    },
  );
  return {
    persistentAuthHeaders: enforceTerminalDraftParameter(persistentAuthHeaders),
    authorizations,
    enabledFeatures,
    isWorkflowsEnabled,
    isTracingEnabled,
    shouldShowTopNav,
    isErrorReportingEnabled,
    partitionKey: parsed.partitionKey || "",
  };
};

export interface SettingsSlice {
  // Auth headers that should be included in every request
  persistentAuthHeaders: KeyValueElement[];
  // Auth tokens that can be used in requests
  // These are stored in local storage
  authorizations: Authorization[];

  // Feature flags
  isWorkflowsEnabled: boolean;
  isTracingEnabled: boolean;
  isErrorReportingEnabled: boolean;
  shouldShowTopNav: boolean;
  enabledFeatures: FeatureFlag[];

  // Workflow settings
  partitionKey: string;

  // Actions
  addAuthorization: (
    authorization: Authorization & Pick<Partial<Authorization>, "id">,
  ) => void;
  updateAuthorization: (authorization: Authorization) => void;
  removeAuthorization: (id: string) => void;
  setPersistentAuthHeaders: (headers: KeyValueElement[]) => void;
  setFeatureEnabled: (feature: FeatureFlag, enabled: boolean) => void;
  setPartitionKey: (key: string) => void;
}

export const settingsSlice: StateCreator<
  StudioState,
  [["zustand/devtools", never]],
  [],
  SettingsSlice
> = (set) => {
  const initialState = loadSettingsFromStorage();

  const updateFeatureFlags = (state: StudioState) => {
    state.isWorkflowsEnabled = state.enabledFeatures.includes(
      FEATURE_FLAG_WORKFLOWS,
    );
    state.isTracingEnabled =
      state.enabledFeatures.includes(FEATURE_FLAG_TRACES);
    state.shouldShowTopNav = state.isWorkflowsEnabled || state.isTracingEnabled;
  };

  return {
    ...initialState,
    addAuthorization: (
      authorization: Authorization & Pick<Partial<Authorization>, "id">,
    ) => {
      const { id = crypto.randomUUID() } = authorization;
      const newAuthorization = { ...authorization, id };
      return set((initialState: StudioState): StudioState => {
        const state = {
          ...initialState,
          authorizations: [...initialState.authorizations],
        };
        state.authorizations.push(newAuthorization);
        localStorage.setItem(
          SETTINGS_STORAGE_KEY,
          JSON.stringify({
            ...state,
            authorizations: state.authorizations,
          }),
        );
        return state;
      });
    },
    updateAuthorization: (authorization: Authorization) => {
      return set((initialState: StudioState): StudioState => {
        const state = {
          ...initialState,
          authorizations: [...initialState.authorizations],
        };
        const index = state.authorizations.findIndex(
          (auth) => auth.id === authorization.id,
        );
        if (index === -1) {
          return state;
        }
        state.authorizations[index] = authorization;
        localStorage.setItem(
          SETTINGS_STORAGE_KEY,
          JSON.stringify({
            ...state,
            authorizations: state.authorizations,
          }),
        );

        return state;
      });
    },
    removeAuthorization: (id: string) => {
      return set((initialState: StudioState): StudioState => {
        const state = {
          ...initialState,
          authorizations: [...initialState.authorizations],
        };
        state.authorizations = state.authorizations.filter(
          (auth) => auth.id !== id,
        );
        localStorage.setItem(
          SETTINGS_STORAGE_KEY,
          JSON.stringify({
            ...state,
            authorizations: state.authorizations,
          }),
        );
        return state;
      });
    },
    setPersistentAuthHeaders: (headers) =>
      set((initialState: StudioState): StudioState => {
        const state = { ...initialState };
        // Always ensure there's at least one draft parameter
        state.persistentAuthHeaders = enforceTerminalDraftParameter(headers);
        localStorage.setItem(
          SETTINGS_STORAGE_KEY,
          JSON.stringify({
            ...state,
            persistentAuthHeaders: state.persistentAuthHeaders,
          }),
        );
        return state;
      }),

    setFeatureEnabled: (feature: FeatureFlag, enabled: boolean) =>
      set((initialState: StudioState): StudioState => {
        const state = {
          ...initialState,
          enabledFeatures: [...initialState.enabledFeatures],
        };
        if (enabled && !state.enabledFeatures.includes(feature)) {
          state.enabledFeatures.push(feature);
        } else if (!enabled) {
          state.enabledFeatures = state.enabledFeatures.filter(
            (f) => f !== feature,
          );
        }

        // Update computed feature flags
        updateFeatureFlags(state);

        localStorage.setItem(
          SETTINGS_STORAGE_KEY,
          JSON.stringify({
            ...state,
            enabledFeatures: state.enabledFeatures,
          }),
        );

        return state;
      }),

    setPartitionKey: (key: string) =>
      set((initialState: StudioState): StudioState => {
        const state = { ...initialState };
        state.partitionKey = key;

        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(state));

        return state;
      }),
  };
};
