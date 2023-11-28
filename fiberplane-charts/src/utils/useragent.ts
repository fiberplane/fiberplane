let isMac = false;

if (typeof navigator !== "undefined") {
  const { platform } = navigator;
  if (
    platform?.startsWith("Mac") ||
    platform?.startsWith("iPhone") ||
    platform?.startsWith("iPad")
  ) {
    isMac = true;
  }
}

export { isMac };
