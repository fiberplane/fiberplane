const os =
    typeof navigator === "undefined"
        ? ""
        : navigator.platform.match(/mac|win|linux/i)?.[0]?.toLowerCase();

export const isMac = os === "mac";
