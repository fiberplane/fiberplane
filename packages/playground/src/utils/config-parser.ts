/**
 * Parses the embedded config from the root element of the DOM.
 *
 * The config should be serialized into the DOM as a data attribute.
 */
export function parseEmbeddedConfig(rootElement: HTMLElement) {
  const {
    mountedPath,
    openapi,
    authTraces,
    hasFiberplaneServicesIntegration,
    hasOtelCollector,
  } = JSON.parse(rootElement.dataset.options as string) as {
    mountedPath: string;
    openapi?: {
      url?: string;
      content?: string;
    };
    authTraces: boolean;
    hasFiberplaneServicesIntegration: boolean;
    hasOtelCollector: boolean;
  };

  return {
    mountedPath,
    openapi,
    authTraces,
    hasFiberplaneServicesIntegration,
    hasOtelCollector,
  };
}
