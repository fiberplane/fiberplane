import { z } from "zod";
export declare const StepParameterSchema: z.ZodObject<{
    name: z.ZodString;
    in: z.ZodEnum<["query", "path", "header", "cookie"]>;
    value: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    in: "path" | "query" | "header" | "cookie";
    value: string;
}, {
    name: string;
    in: "path" | "query" | "header" | "cookie";
    value: string;
}>;
export declare const StepRequestBodySchema: z.ZodObject<{
    contentType: z.ZodEnum<["application/json", "application/x-www-form-urlencoded", "multipart/form-data"]>;
    payload: z.ZodUnion<[z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">, z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>>]>>, z.ZodString, z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean]>>]>;
    replacements: z.ZodArray<z.ZodObject<{
        target: z.ZodString;
        value: z.ZodAny;
    }, "strip", z.ZodTypeAny, {
        target: string;
        value?: any;
    }, {
        target: string;
        value?: any;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    contentType: "application/json" | "application/x-www-form-urlencoded" | "multipart/form-data";
    payload: string | Record<string, string | number | boolean | (string | number | boolean | null)[] | Record<string, string | number | boolean | null> | null> | Record<string, string | number | boolean>;
    replacements: {
        target: string;
        value?: any;
    }[];
}, {
    contentType: "application/json" | "application/x-www-form-urlencoded" | "multipart/form-data";
    payload: string | Record<string, string | number | boolean | (string | number | boolean | null)[] | Record<string, string | number | boolean | null> | null> | Record<string, string | number | boolean>;
    replacements: {
        target: string;
        value?: any;
    }[];
}>;
export declare const StepSuccessCriteriaSchema: z.ZodObject<{
    condition: z.ZodString;
}, "strip", z.ZodTypeAny, {
    condition: string;
}, {
    condition: string;
}>;
export declare const OutputSchema: z.ZodObject<{
    key: z.ZodString;
    value: z.ZodString;
}, "strip", z.ZodTypeAny, {
    key: string;
    value: string;
}, {
    key: string;
    value: string;
}>;
export declare const StepSchema: z.ZodObject<{
    stepId: z.ZodString;
    description: z.ZodString;
    operation: z.ZodObject<{
        method: z.ZodEnum<["get", "post", "put", "delete", "patch", "head", "options", "trace"]>;
        path: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        method: "get" | "trace" | "put" | "post" | "delete" | "options" | "head" | "patch";
        path: string;
    }, {
        method: "get" | "trace" | "put" | "post" | "delete" | "options" | "head" | "patch";
        path: string;
    }>;
    parameters: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        in: z.ZodEnum<["query", "path", "header", "cookie"]>;
        value: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        in: "path" | "query" | "header" | "cookie";
        value: string;
    }, {
        name: string;
        in: "path" | "query" | "header" | "cookie";
        value: string;
    }>, "many">>;
    requestBody: z.ZodOptional<z.ZodObject<{
        contentType: z.ZodEnum<["application/json", "application/x-www-form-urlencoded", "multipart/form-data"]>;
        payload: z.ZodUnion<[z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">, z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>>]>>, z.ZodString, z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean]>>]>;
        replacements: z.ZodArray<z.ZodObject<{
            target: z.ZodString;
            value: z.ZodAny;
        }, "strip", z.ZodTypeAny, {
            target: string;
            value?: any;
        }, {
            target: string;
            value?: any;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        contentType: "application/json" | "application/x-www-form-urlencoded" | "multipart/form-data";
        payload: string | Record<string, string | number | boolean | (string | number | boolean | null)[] | Record<string, string | number | boolean | null> | null> | Record<string, string | number | boolean>;
        replacements: {
            target: string;
            value?: any;
        }[];
    }, {
        contentType: "application/json" | "application/x-www-form-urlencoded" | "multipart/form-data";
        payload: string | Record<string, string | number | boolean | (string | number | boolean | null)[] | Record<string, string | number | boolean | null> | null> | Record<string, string | number | boolean>;
        replacements: {
            target: string;
            value?: any;
        }[];
    }>>;
    successCriteria: z.ZodDefault<z.ZodArray<z.ZodObject<{
        condition: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        condition: string;
    }, {
        condition: string;
    }>, "many">>;
    outputs: z.ZodDefault<z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        value: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        key: string;
        value: string;
    }, {
        key: string;
        value: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    description: string;
    parameters: {
        name: string;
        in: "path" | "query" | "header" | "cookie";
        value: string;
    }[];
    stepId: string;
    operation: {
        method: "get" | "trace" | "put" | "post" | "delete" | "options" | "head" | "patch";
        path: string;
    };
    successCriteria: {
        condition: string;
    }[];
    outputs: {
        key: string;
        value: string;
    }[];
    requestBody?: {
        contentType: "application/json" | "application/x-www-form-urlencoded" | "multipart/form-data";
        payload: string | Record<string, string | number | boolean | (string | number | boolean | null)[] | Record<string, string | number | boolean | null> | null> | Record<string, string | number | boolean>;
        replacements: {
            target: string;
            value?: any;
        }[];
    } | undefined;
}, {
    description: string;
    stepId: string;
    operation: {
        method: "get" | "trace" | "put" | "post" | "delete" | "options" | "head" | "patch";
        path: string;
    };
    parameters?: {
        name: string;
        in: "path" | "query" | "header" | "cookie";
        value: string;
    }[] | undefined;
    requestBody?: {
        contentType: "application/json" | "application/x-www-form-urlencoded" | "multipart/form-data";
        payload: string | Record<string, string | number | boolean | (string | number | boolean | null)[] | Record<string, string | number | boolean | null> | null> | Record<string, string | number | boolean>;
        replacements: {
            target: string;
            value?: any;
        }[];
    } | undefined;
    successCriteria?: {
        condition: string;
    }[] | undefined;
    outputs?: {
        key: string;
        value: string;
    }[] | undefined;
}>;
export declare const WorkflowSchema: z.ZodObject<{
    workflowId: z.ZodString;
    prompt: z.ZodString;
    summary: z.ZodString;
    description: z.ZodString;
    steps: z.ZodArray<z.ZodObject<{
        stepId: z.ZodString;
        description: z.ZodString;
        operation: z.ZodObject<{
            method: z.ZodEnum<["get", "post", "put", "delete", "patch", "head", "options", "trace"]>;
            path: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            method: "get" | "trace" | "put" | "post" | "delete" | "options" | "head" | "patch";
            path: string;
        }, {
            method: "get" | "trace" | "put" | "post" | "delete" | "options" | "head" | "patch";
            path: string;
        }>;
        parameters: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            in: z.ZodEnum<["query", "path", "header", "cookie"]>;
            value: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            in: "path" | "query" | "header" | "cookie";
            value: string;
        }, {
            name: string;
            in: "path" | "query" | "header" | "cookie";
            value: string;
        }>, "many">>;
        requestBody: z.ZodOptional<z.ZodObject<{
            contentType: z.ZodEnum<["application/json", "application/x-www-form-urlencoded", "multipart/form-data"]>;
            payload: z.ZodUnion<[z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>, "many">, z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>>]>>, z.ZodString, z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean]>>]>;
            replacements: z.ZodArray<z.ZodObject<{
                target: z.ZodString;
                value: z.ZodAny;
            }, "strip", z.ZodTypeAny, {
                target: string;
                value?: any;
            }, {
                target: string;
                value?: any;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            contentType: "application/json" | "application/x-www-form-urlencoded" | "multipart/form-data";
            payload: string | Record<string, string | number | boolean | (string | number | boolean | null)[] | Record<string, string | number | boolean | null> | null> | Record<string, string | number | boolean>;
            replacements: {
                target: string;
                value?: any;
            }[];
        }, {
            contentType: "application/json" | "application/x-www-form-urlencoded" | "multipart/form-data";
            payload: string | Record<string, string | number | boolean | (string | number | boolean | null)[] | Record<string, string | number | boolean | null> | null> | Record<string, string | number | boolean>;
            replacements: {
                target: string;
                value?: any;
            }[];
        }>>;
        successCriteria: z.ZodDefault<z.ZodArray<z.ZodObject<{
            condition: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            condition: string;
        }, {
            condition: string;
        }>, "many">>;
        outputs: z.ZodDefault<z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            value: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            key: string;
            value: string;
        }, {
            key: string;
            value: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        parameters: {
            name: string;
            in: "path" | "query" | "header" | "cookie";
            value: string;
        }[];
        stepId: string;
        operation: {
            method: "get" | "trace" | "put" | "post" | "delete" | "options" | "head" | "patch";
            path: string;
        };
        successCriteria: {
            condition: string;
        }[];
        outputs: {
            key: string;
            value: string;
        }[];
        requestBody?: {
            contentType: "application/json" | "application/x-www-form-urlencoded" | "multipart/form-data";
            payload: string | Record<string, string | number | boolean | (string | number | boolean | null)[] | Record<string, string | number | boolean | null> | null> | Record<string, string | number | boolean>;
            replacements: {
                target: string;
                value?: any;
            }[];
        } | undefined;
    }, {
        description: string;
        stepId: string;
        operation: {
            method: "get" | "trace" | "put" | "post" | "delete" | "options" | "head" | "patch";
            path: string;
        };
        parameters?: {
            name: string;
            in: "path" | "query" | "header" | "cookie";
            value: string;
        }[] | undefined;
        requestBody?: {
            contentType: "application/json" | "application/x-www-form-urlencoded" | "multipart/form-data";
            payload: string | Record<string, string | number | boolean | (string | number | boolean | null)[] | Record<string, string | number | boolean | null> | null> | Record<string, string | number | boolean>;
            replacements: {
                target: string;
                value?: any;
            }[];
        } | undefined;
        successCriteria?: {
            condition: string;
        }[] | undefined;
        outputs?: {
            key: string;
            value: string;
        }[] | undefined;
    }>, "many">;
    inputs: z.ZodObject<{
        type: z.ZodEnum<["string", "number", "integer", "boolean", "object", "array"]>;
        properties: z.ZodRecord<z.ZodString, z.ZodAny>;
        required: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        required: string[];
        type: "string" | "number" | "boolean" | "object" | "array" | "integer";
        properties: Record<string, any>;
    }, {
        required: string[];
        type: "string" | "number" | "boolean" | "object" | "array" | "integer";
        properties: Record<string, any>;
    }>;
    outputs: z.ZodDefault<z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        value: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        key: string;
        value: string;
    }, {
        key: string;
        value: string;
    }>, "many">>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    description: string;
    summary: string;
    outputs: {
        key: string;
        value: string;
    }[];
    workflowId: string;
    prompt: string;
    steps: {
        description: string;
        parameters: {
            name: string;
            in: "path" | "query" | "header" | "cookie";
            value: string;
        }[];
        stepId: string;
        operation: {
            method: "get" | "trace" | "put" | "post" | "delete" | "options" | "head" | "patch";
            path: string;
        };
        successCriteria: {
            condition: string;
        }[];
        outputs: {
            key: string;
            value: string;
        }[];
        requestBody?: {
            contentType: "application/json" | "application/x-www-form-urlencoded" | "multipart/form-data";
            payload: string | Record<string, string | number | boolean | (string | number | boolean | null)[] | Record<string, string | number | boolean | null> | null> | Record<string, string | number | boolean>;
            replacements: {
                target: string;
                value?: any;
            }[];
        } | undefined;
    }[];
    inputs: {
        required: string[];
        type: "string" | "number" | "boolean" | "object" | "array" | "integer";
        properties: Record<string, any>;
    };
    createdAt: Date;
    updatedAt: Date;
}, {
    description: string;
    summary: string;
    workflowId: string;
    prompt: string;
    steps: {
        description: string;
        stepId: string;
        operation: {
            method: "get" | "trace" | "put" | "post" | "delete" | "options" | "head" | "patch";
            path: string;
        };
        parameters?: {
            name: string;
            in: "path" | "query" | "header" | "cookie";
            value: string;
        }[] | undefined;
        requestBody?: {
            contentType: "application/json" | "application/x-www-form-urlencoded" | "multipart/form-data";
            payload: string | Record<string, string | number | boolean | (string | number | boolean | null)[] | Record<string, string | number | boolean | null> | null> | Record<string, string | number | boolean>;
            replacements: {
                target: string;
                value?: any;
            }[];
        } | undefined;
        successCriteria?: {
            condition: string;
        }[] | undefined;
        outputs?: {
            key: string;
            value: string;
        }[] | undefined;
    }[];
    inputs: {
        required: string[];
        type: "string" | "number" | "boolean" | "object" | "array" | "integer";
        properties: Record<string, any>;
    };
    createdAt: Date;
    updatedAt: Date;
    outputs?: {
        key: string;
        value: string;
    }[] | undefined;
}>;
export declare const GenerateWorkflowRequestSchema: z.ZodObject<{
    prompt: z.ZodString;
    openApiSchema: z.ZodString;
}, "strip", z.ZodTypeAny, {
    prompt: string;
    openApiSchema: string;
}, {
    prompt: string;
    openApiSchema: string;
}>;
export type StepParameter = z.infer<typeof StepParameterSchema>;
export type StepSuccessCriteria = z.infer<typeof StepSuccessCriteriaSchema>;
export type StepOutput = z.infer<typeof OutputSchema>;
export type Step = z.infer<typeof StepSchema>;
export type Workflow = z.infer<typeof WorkflowSchema>;
export type GenerateWorkflow = z.infer<typeof GenerateWorkflowRequestSchema>;
export type WorkflowInputs = z.infer<typeof WorkflowSchema>["inputs"];
export type WorkflowOutputs = z.infer<typeof WorkflowSchema>["outputs"];
export type WorkflowHeader = Pick<Workflow, "workflowId" | "summary" | "description">;
