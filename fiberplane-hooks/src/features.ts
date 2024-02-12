import { useMemo } from "react";
import { useEffectOnce } from "./useEffectOnce";
import { useLocalStorage } from "./useLocalStorage";

/**
 * Accepts an array of feature names and returns hooks for working with them.
 * @param features An array of feature names
 * @param featuresKey The key to use for storing the features in `localStorage`.
 * Defaults to `"features"`.
 * @returns An object containing hooks for working with feature flags:
 * - `useFeatures` - A hook that returns the enabled state of all features and a
 * setter for changing it.
 * - `useFeature` - A hook that accepts a supported feature name and returns
 * both its enabled state and a setter for changing the state.
 * - `useFeaturesFromSearchParams` - A hook that handles the initial state of
 * features based on the query params. This hook should only be called once on
 * app load, and filters out unsupported features.
 * @returns Additionally, the returned object contains the following properties:
 * - `features` - Contains the original array of feature names. This can be used
 * to write your own type validators for features.
 * @example
 * // src/hooks/features.ts
 * import { getFeatureHooks } from "@fiberplane/hooks";
 *
 * export const {
 *   features,
 *   useFeature,
 *   useFeatures,
 *   useFeaturesFromSearchParams,
 * } = getFeatureHooks(["experimental-nav", "unstable-feature"]);
 *
 * export type Feature = (typeof features)[number];
 *
 * export function isFeature(feature: string): feature is Feature {
 *   return feature === "experimental-nav" || feature === "unstable-feature";
 * }
 */
export function getFeatureHooks<const F extends string>(
  FEATURES: Array<F>,
  FEATURES_KEY = "features",
) {
  type Feature = typeof FEATURES[number];

  function isFeature(feature: string): feature is Feature {
    return FEATURES.includes(feature as Feature);
  }

  type Features = {
    /**
     * Indicates whether (beta) features are enabled or not. Regardless of
     * individual feature flags' enabled state, this property determines whether
     * the app should enable features or not.
     */
    enabled: boolean;
    features: Array<{
      name: Feature;
      enabled: boolean;
    }>;
  };

  const initialFeatures: Features = {
    enabled: false,
    features: FEATURES.map((name) => ({
      name,
      enabled: false,
    })),
  };

  function useFeatures() {
    const [storedFeatures, setStoredFeatures] = useValidStoredFeatures();
    const enableFeatures = storedFeatures.enabled;

    const setEnableFeatures = (enabled: boolean) => {
      if (enabled) {
        setStoredFeatures({
          ...storedFeatures,
          enabled,
        });
        return;
      }

      // When features are disabled, we fall back to the initial feature state
      setStoredFeatures(initialFeatures);
    };

    return [enableFeatures, setEnableFeatures] as const;
  }

  /**
   * Hook that accepts a supported feature name and returns both its enabled
   * state and a setter for changing the state.
   */
  function useFeature(feature: Feature) {
    const [{ enabled: featuresEnabled, features }, setStoredFeatures] =
      useValidStoredFeatures();

    const isFeatureEnabled = useMemo(() => {
      const storedFeature = features.find(({ name }) => name === feature);
      if (!storedFeature) {
        return false;
      }

      return featuresEnabled && storedFeature.enabled;
    }, [feature, features, featuresEnabled]);

    const setIsFeatureEnabled = (featureEnabled: boolean) => {
      const updatedFeatures = FEATURES.map((key) => {
        const existing = features.find(({ name }) => name === key);

        const enabled =
          key === feature ? featureEnabled : existing?.enabled ?? false;

        return {
          name: key,
          enabled,
        };
      });

      setStoredFeatures({
        enabled: featuresEnabled,
        features: updatedFeatures,
      });
    };

    return [isFeatureEnabled, setIsFeatureEnabled] as const;
  }

  /**
   * Hook that handles the initial state of features based on the query params.
   * This hook should only be called once on app load, and filters out
   * unsupported features.
   */
  function useFeaturesFromSearchParams() {
    const [{ features: validStoredFeatures }, setStoredFeatures] =
      useValidStoredFeatures();

    const searchParams = new URLSearchParams(window.location.search);
    const parameterFeatures = searchParams.get(FEATURES_KEY)?.split(",") || [];
    const validFeatures = new Set(parameterFeatures.filter(isFeature));

    // As the localStorage features aren't updated immediately on initial load,
    // we use an empty array as a fallback. We can remove this fallback once we
    // get rid of the temporary hook below.
    const updatedFeatures = (validStoredFeatures || []).map((storedFeature) => {
      if (validFeatures.has(storedFeature.name)) {
        return {
          ...storedFeature,
          enabled: true,
        };
      }

      return storedFeature;
    });

    useEffectOnce(() => {
      if (validFeatures.size === 0) {
        return;
      }

      setStoredFeatures({
        enabled: true,
        features: updatedFeatures,
      });
    });
  }

  /**
   * Temporary hook to handle the transition from the old feature to the new
   * feature state. As we're using the same key for both, we need to handle both
   * cases.
   */
  function useValidStoredFeatures() {
    const [features, setFeatures] = useLocalStorage<Features>(
      FEATURES_KEY,
      initialFeatures,
    );

    if (Array.isArray(features)) {
      const validFeatures = new Set(features.filter(isFeature));

      setFeatures({
        enabled: validFeatures.size > 0,
        features: FEATURES.map((name) => ({
          name,
          enabled: validFeatures.has(name),
        })),
      });
    }

    return [features, setFeatures] as const;
  }

  return {
    features: FEATURES,
    /**
     * Returns the enabled state of all features and a setter for changing it.
     */
    useFeatures,
    /**
     * Accepts a supported feature name and returns both its enabled state and a
     * setter for changing the state.
     */
    useFeature,
    /**
     * Handles the initial state of features based on the query params. This
     * hook should only be called once on app load, and filters out unsupported
     * features.
     */
    useFeaturesFromSearchParams,
  };
}
