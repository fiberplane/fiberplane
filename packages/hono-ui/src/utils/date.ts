import { format } from "date-fns";

export function formatDate(d: Date | string) {
  return format(new Date(d), "HH:mm:ss.SSS");
}
