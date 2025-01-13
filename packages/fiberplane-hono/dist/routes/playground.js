import { jsx as _jsx, jsxs as _jsxs } from "hono/jsx/jsx-runtime";
import { Hono } from "hono";
export default function createPlayground(sanitizedOptions) {
    const app = new Hono();
    const { cdn, ...options } = sanitizedOptions;
    const cssBundleUrl = new URL("index.css", cdn).href;
    const jsBundleUrl = new URL("index.js", cdn).href;
    app.get("/*", (c) => {
        return c.html(_jsxs("html", { lang: "en", children: [_jsxs("head", { children: [_jsx("title", { children: "API Playground" }), _jsx("meta", { charSet: "utf-8" }), _jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }), _jsx("link", { rel: "stylesheet", href: cssBundleUrl })] }), _jsxs("body", { children: [_jsx("div", { id: "root", "data-options": JSON.stringify(options) }), _jsx("script", { type: "module", src: jsBundleUrl })] })] }));
    });
    return app;
}
