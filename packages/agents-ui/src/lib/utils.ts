import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function noop() {}

/**
 * Returns a string representation of the HTTP method.
 *
 * In practice, shortens the method name to be 3-5 characters.
 */
export function getHttpMethodString(method: string) {
  return {
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    PATCH: "PATCH",
    DELETE: "DEL",
    OPTIONS: "OPT",
    HEAD: "HEAD",
    TRACE: "TRACE",
  }[String(method).toUpperCase()];
}

export function getHttpMethodTextColor(method: string) {
  return {
    GET: "text-info",
    POST: "text-success",
    PUT: "text-warning",
    PATCH: "text-warning",
    DELETE: "text-danger",
    OPTIONS: "text-info",
    HEAD: "text-info",
    TRACE: "text-info",
  }[String(method).toUpperCase()];
}
