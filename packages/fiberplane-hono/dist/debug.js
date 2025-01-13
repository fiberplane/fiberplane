export function logIfDebug(debug, message, ...params) {
    try {
        // If debug is a boolean, we use it directly
        // If "debug" is a Context, we check the debug flag from the context's variable's map
        const debugEnabled = typeof debug === "boolean" ? debug : !!debug?.get("debug");
        if (debugEnabled) {
            console.debug("[fiberplane:debug] ", message, ...params);
        }
    }
    catch {
        // If the debug log failed for whatever reason, we'll just swallow the error
    }
}
