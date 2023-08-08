/**
 * Converts an RFC 3339-formatted timestamp to a time expressed in seconds since
 * the UNIX epoch.
 */
export function getTimeFromTimestamp(timestamp: string): number {
  const time = new Date(timestamp).getTime() / 1000;
  if (Number.isNaN(time)) {
    throw new TypeError(`Invalid timestamp: ${timestamp}`);
  }

  return time;
}
