import jsonpointer from "jsonpointer";
function resolvePathAndMethod(step) {
    return {
        path: step.operation.path,
        method: step.operation.method,
    };
}
function resolveParameters(parameters, context) {
    return parameters.reduce((acc, param) => {
        acc[param.name] = String(resolveReference(param.value, context));
        return acc;
    }, {});
}
function resolveBody(requestBody, context) {
    if (!requestBody) {
        return undefined;
    }
    const { payload } = requestBody;
    // Handle string payload (runtime expression)
    if (typeof payload === "string") {
        return resolveReference(payload, context);
    }
    // Handle object payload
    if (typeof payload === "object") {
        const resolvedBody = Object.entries(payload).reduce((acc, [key, value]) => {
            acc[key] =
                typeof value === "string" && value.startsWith("$")
                    ? resolveReference(value, context)
                    : value;
            return acc;
        }, {});
        // Apply replacements if any
        // for (const { target, value } of replacements) {
        //   if (!target || !value) {
        //     continue;
        //   }
        //   const parts = target.split("/").filter(Boolean);
        //   let current = resolvedBody;
        //   // Navigate to the target location
        //   for (let i = 0; i < parts.length - 1; i++) {
        //     const part = parts[i];
        //     current[part] = current[part] || {};
        //     current = current[part] as Record<string, unknown>;
        //   }
        //   // Apply the replacement
        //   const lastPart = parts[parts.length - 1];
        //   current[lastPart] = value;
        // }
        return resolvedBody;
    }
    return undefined;
}
export async function resolveStepParams(step, context) {
    const { path, method } = resolvePathAndMethod(step);
    const parameters = resolveParameters(step.parameters, context);
    const body = resolveBody(step.requestBody, context);
    return {
        path,
        method,
        parameters,
        ...(body ? { body } : {}),
    };
}
export function resolveOutputs(workflow, context) {
    return workflow.outputs.reduce((acc, output) => {
        acc[output.key] = resolveReference(output.value, context);
        return acc;
    }, {});
}
export function resolveReference(value, context) {
    // If not an expression, return as is
    if (!value.startsWith("$") && !value.includes("{$")) {
        return value;
    }
    // Handle template expressions like "Bearer {$steps.authenticate.outputs.token}"
    if (value.includes("{$")) {
        return value.replace(/\{([^}]+)\}/g, (_, expr) => {
            const resolved = resolveReference(expr, context);
            return resolved === undefined ? "" : String(resolved);
        });
    }
    // Parse the expression parts
    const [basePath, jsonPointerPath] = value.split("#");
    const parts = basePath.split(".");
    const expressionType = parts[0].substring(1); // Remove $ prefix
    // Get the base value based on expression type
    let baseValue;
    switch (expressionType) {
        case "inputs":
            baseValue = context.inputs;
            parts.shift(); // Remove 'inputs'
            break;
        case "steps": {
            const steps = context.steps;
            parts.shift(); // Remove 'steps'
            if (parts.length < 2) {
                return undefined;
            }
            const stepId = parts[0];
            const propertyName = parts[1];
            // Only allow 'inputs' or 'outputs' as properties of steps
            if (propertyName !== "inputs" && propertyName !== "outputs") {
                return undefined;
            }
            const step = steps[stepId];
            if (!step) {
                return undefined;
            }
            baseValue = step[propertyName];
            parts.splice(0, 2); // Remove stepId and property name
            break;
        }
        case "response": {
            // Only allow $response if we're in a step context
            if (!("response" in context)) {
                return undefined;
            }
            baseValue = context.response;
            parts.shift(); // Remove 'response'
            break;
        }
        default:
            return undefined;
    }
    // Resolve the path
    for (const part of parts) {
        if (baseValue === undefined || baseValue === null) {
            return undefined;
        }
        baseValue = baseValue[part];
    }
    // If there's a JSON pointer, resolve it using jsonpointer
    if (jsonPointerPath) {
        try {
            const pointer = jsonPointerPath.startsWith("/")
                ? jsonPointerPath
                : `/${jsonPointerPath}`;
            return jsonpointer.get(baseValue, pointer);
        }
        catch {
            return undefined;
        }
    }
    return baseValue;
}
export function resolveStepOutputs(step, response) {
    if (!step.outputs?.length) {
        return undefined;
    }
    return step.outputs.reduce((acc, output) => {
        acc[output.key] = resolveReference(output.value, { response });
        return acc;
    }, {});
}
