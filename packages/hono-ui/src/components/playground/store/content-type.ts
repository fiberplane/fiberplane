import { enforceTerminalDraftParameter } from "../KeyValueForm";
import { isDraftElement } from "../KeyValueForm/data";
import { getRouteId } from "./slices/requestResponseSlice";
import type {
  ApiCallData,
  RequestResponseSlice,
  RoutesSlice,
} from "./slices/types";
import type { KeyValueElement, PlaygroundBody } from "./types";

/**
 * This makes sure to synchronize the content type header with the body type.
 * But there are a few caveats!
 *
 * - If the body is a multipart form, we don't want to add the content type header
 *   We only want to remove the content type header if it's set to text/* or application/json
 *
 * - If the body is a file, we only want to remove the content type header if it's set to text/* or application/json
 *   We don't want to add a content type header for files, to give the user the ability to set the content type themselves,
 *   otherwise fetch will just add application/octet-stream
 *
 * - If the body is a json, we want to set/update the content type to application/json
 *
 * - If the body is a text, we want to set/update the content type to text/plain
 */
export function updateContentTypeHeaderInState(
  state: RequestResponseSlice & Pick<RoutesSlice, "activeRoute">,
) {
  const { apiCallState } = state;
  if (!state.activeRoute) {
    console.warn("Cannot update content type headers. There is no activeRoute");
    return;
  }
  const id = getRouteId(state.activeRoute);
  const params = apiCallState[id];
  const currentHeaders = params.requestHeaders;
  const currentContentTypeHeader = getCurrentContentType(params);

  const updateOperation = getUpdateOperation(state, currentContentTypeHeader);

  let nextHeaders = currentHeaders;
  if (updateOperation?.type === "add") {
    nextHeaders = addHeader(currentHeaders, updateOperation.value);
  }
  if (updateOperation?.type === "update") {
    nextHeaders = updateHeader(currentHeaders, updateOperation.value);
  }
  if (updateOperation?.type === "remove") {
    nextHeaders = removeHeader(currentHeaders, updateOperation.value);
  }

  params.requestHeaders = enforceTerminalDraftParameter(nextHeaders);
}

function addHeader(
  currentHeaders: KeyValueElement[],
  newHeader: KeyValueElement,
) {
  return currentHeaders.filter((p) => !isDraftElement(p)).concat(newHeader);
}

function updateHeader(
  currentHeaders: KeyValueElement[],
  newHeader: KeyValueElement,
) {
  return currentHeaders.map((p) => (p.id === newHeader.id ? newHeader : p));
}

function removeHeader(
  currentHeaders: KeyValueElement[],
  header: KeyValueElement,
) {
  return currentHeaders.filter((p) => p.id !== header.id);
}

// NOTE - This logic is partly duplicated in `usePlaygroundSubmitHandler`
//        We should refactor to share this logic
function mapBodyToContentType(body: PlaygroundBody) {
  if (body.type === "form-data" && body.isMultipart) {
    return "multipart/form-data";
  }
  if (body.type === "form-data" && !body.isMultipart) {
    return "application/x-www-form-urlencoded";
  }

  // NOTE - Uses the mime type of the file, but falls back to application/octet-stream
  if (body.type === "file") {
    return body.value?.type ?? "application/octet-stream";
  }

  if (body.type === "json") {
    return "application/json";
  }
  if (body.type === "text") {
    return "text/plain";
  }

  return "text/plain";
}

function getCurrentContentType(state: ApiCallData) {
  const currentContentType = state.requestHeaders.find(
    (header) => header.key?.toLowerCase() === "content-type",
  );
  if (!currentContentType) {
    return null;
  }
  return currentContentType;
}

function getUpdateOperation(
  state: RequestResponseSlice & Pick<RoutesSlice, "activeRoute">,
  currentContentTypeHeader: KeyValueElement | null,
) {
  const { activeRoute } = state;
  const canHaveBody =
    activeRoute?.method !== "GET" && activeRoute?.method !== "HEAD";

  // Handle the case where the method doesn't support a body, so we don't want to add the content type header
  if (!canHaveBody || !activeRoute) {
    return currentContentTypeHeader
      ? {
          type: "remove" as const,
          value: currentContentTypeHeader,
        }
      : null;
  }

  const id = getRouteId(activeRoute);

  const params = state.apiCallState[id];
  const currentBody = params.body;
  const nextContentTypeValue = mapBodyToContentType(currentBody);

  const headerData = currentContentTypeHeader?.data;
  if (
    headerData?.type !== "string" ||
    headerData.value.startsWith(nextContentTypeValue)
  ) {
    // `null` means "no change"
    return null;
  }

  // If there's no content type header, we might want to add one
  if (!currentContentTypeHeader) {
    // HACK - Avoid adding the content type header when the body is multipart form-data
    //        We don't want to mess up the form boundary added by fetch (it will cause errors)
    if (currentBody.type === "form-data" && currentBody.isMultipart) {
      return null;
    }

    // Add the content type header
    return {
      type: "add" as const,
      value: {
        id: crypto.randomUUID(),
        key: "Content-Type",
        data: {
          type: "string" as const,
          value: nextContentTypeValue,
        },
        enabled: true,
        parameter: {
          name: "Content-Type",
          in: "headers",
        },
      },
    };
  }

  // If the method is GET or HEAD, we don't want to add the content type header
  if (activeRoute.method === "GET" || activeRoute.method === "HEAD") {
    return {
      type: "remove" as const,
      value: currentContentTypeHeader,
    };
  }

  // Remove the content type header if the new body is multipart form-data,
  // and the user hasn't specified a multipart/form-data content type
  if (
    currentBody.type === "form-data" &&
    currentBody.isMultipart &&
    currentContentTypeHeader.data?.type === "string" &&
    !currentContentTypeHeader.data.value.startsWith("multipart/form-data")
  ) {
    return {
      type: "remove" as const,
      value: currentContentTypeHeader,
    };
  }

  // Update the content type header
  return {
    type: "update" as const,
    value: {
      ...currentContentTypeHeader,
      value: nextContentTypeValue,
      operation: {
        name: currentContentTypeHeader.key,
        in: "header",
      },
    },
  };
}
