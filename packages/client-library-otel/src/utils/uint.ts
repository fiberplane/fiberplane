export function isUintArray(arr: unknown): arr is number[] {
  return (
    arr instanceof Uint8Array ||
    arr instanceof Uint16Array ||
    arr instanceof Uint32Array
  );
}
