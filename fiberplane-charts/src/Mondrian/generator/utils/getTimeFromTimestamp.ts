/**
 * Converts an RFC 3339-formatted timestamp to a time expressed in milliseconds.
 */
export function getTimeFromTimestamp(timestamp: string): number {
  const time = new Date(timestamp).getTime();
  if (Number.isNaN(time)) {
    throw new TypeError(`Invalid timestamp: ${timestamp}`);
  }

  return time;
}
