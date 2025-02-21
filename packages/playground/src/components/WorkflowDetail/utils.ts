export function extractStepName(selector: string) {
  // Match the pattern to extract the step name
  const match = selector.match(/\$steps\.(\w+)\.outputs\.\w+/);
  return match ? match[1] : null; // Return the step name or null if not found
}
