import type { Response as WorkerResponse } from "@cloudflare/workers-types";
import { FPX_REQUEST_BODY } from "../../constants";
import type { GlobalResponse } from "../../types";

export function formatBody(body: BodyInit) {
  if (body instanceof FormData) {
    return formDataToJson(body);
  }

  if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) {
    return "#fpx.arrayBuffer";
  }
  if (body instanceof ReadableStream) {
    return "#fpx.stream";
  }
  if (body instanceof Blob) {
    return "#fpx.blob";
  }

  if (body instanceof URLSearchParams) {
    return body.toString();
  }

  return body;
}

export async function formatRootRequestBody(request: Request) {
  if (!request.body) {
    return null;
  }

  const contentType = request.headers.get("content-type");

  const shouldParseAsText =
    contentType?.includes("application/json") ||
    contentType?.includes("text/") ||
    contentType?.includes("x-www-form-urlencoded");

  if (shouldParseAsText) {
    // Return as text
    return {
      [FPX_REQUEST_BODY]: await request.text(),
    };
  }

  // TODO - Check how files are handled
  if (contentType?.includes("multipart/form-data")) {
    const formData = await request.formData();
    const textifiedFormData = formDataToJson(formData);
    return {
      [FPX_REQUEST_BODY]: textifiedFormData,
    };
  }

  return {
    [FPX_REQUEST_BODY]: formatBody(request.body),
  };
}

function formDataToJson(formData: FormData) {
  const jsonObject: Record<string, string | Array<string>> = {};

  for (const [key, value] of formData.entries()) {
    // Handle multiple values for the same key (e.g., checkboxes)
    if (jsonObject[key]) {
      if (!Array.isArray(jsonObject[key])) {
        jsonObject[key] = [jsonObject[key]];
      }
      jsonObject[key].push(value ? formDataValueToString(value) : value);
    } else {
      jsonObject[key] = value ? formDataValueToString(value) : value;
    }
  }

  return JSON.stringify(jsonObject);
}

export function formDataValueToString(value: string | File) {
  if (value instanceof File) {
    return value.name ?? `#fpx.file.{${value.name}}.{${value.size}}`;
  }

  return value;
}

export async function tryGetResponseBodyAsText(
  response: GlobalResponse | WorkerResponse,
) {
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("image/")) {
    return "#fpx.image";
  }
  if (contentType?.includes("application/pdf")) {
    return "#fpx.pdf";
  }
  if (contentType?.includes("application/zip")) {
    return "#fpx.zip";
  }
  if (contentType?.includes("audio/")) {
    return "#fpx.audio";
  }
  if (contentType?.includes("video/")) {
    return "#fpx.video";
  }
  if (
    contentType?.includes("application/octet-stream") ||
    contentType?.includes("application/vnd.ms-excel") ||
    contentType?.includes(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ) ||
    contentType?.includes("application/vnd.ms-powerpoint") ||
    contentType?.includes(
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ) ||
    contentType?.includes("application/msword") ||
    contentType?.includes(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    )
  ) {
    return "#fpx.binary";
  }

  try {
    if (response.body) {
      const clonedResponse = response.clone();
      return await streamToString(clonedResponse.body as ReadableStream);
    }
  } catch {
    // swallow error
  }

  return null;
}

// Helper function to convert a ReadableStream to a string
async function streamToString(stream: ReadableStream) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let result = "";

  while (true) {
    const { done, value } = await reader.read();
    result += decoder.decode(value, { stream: true });
    if (done) {
      break;
    }
  }

  return result;
}
