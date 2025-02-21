export function getPathFromUrl(url: string): string | null {
  try {
    return new URL(url).pathname;
  } catch (error) {
    return null;
  }
}
