// ============================================= //
// WebAssembly runtime for TypeScript            //
//                                               //
// This file is generated. PLEASE DO NOT MODIFY. //
// ============================================= //
// deno-lint-ignore-file no-explicit-any no-unused-vars

import { encode, decode } from "@msgpack/msgpack";

import type * as types from "./types";

type FatPtr = bigint;

export type Imports = {
    log: (message: string) => void;
    makeHttpRequest: (request: types.HttpRequest) => Promise<types.Result<types.HttpResponse, types.HttpRequestError>>;
    now: () => types.Timestamp;
    random: (len: number) => Array<number>;
};

export type Exports = {
    createCells?: (queryType: string, response: types.Blob) => types.Result<Array<types.Cell>, types.Error>;
    extractData?: (response: types.Blob, mimeType: string, query: string | null) => types.Result<types.Blob, types.Error>;
    getConfigSchema?: () => types.ConfigSchema;
    getSupportedQueryTypes?: (config: types.ProviderConfig) => Promise<Array<types.SupportedQueryType>>;
    invoke2?: (request: types.ProviderRequest) => Promise<types.Result<types.Blob, types.Error>>;
    createCellsRaw?: (queryType: Uint8Array, response: Uint8Array) => Uint8Array;
    extractDataRaw?: (response: Uint8Array, mimeType: Uint8Array, query: Uint8Array) => Uint8Array;
    getConfigSchemaRaw?: () => Uint8Array;
    getSupportedQueryTypesRaw?: (config: Uint8Array) => Promise<Uint8Array>;
    invoke2Raw?: (request: Uint8Array) => Promise<Uint8Array>;
};

/**
 * Represents an unrecoverable error in the FP runtime.
 *
 * After this, your only recourse is to create a new runtime, probably with a different WASM plugin.
 */
export class FPRuntimeError extends Error {
    constructor(message: string) {
        super(message);
    }
}

/**
 * Creates a runtime for executing the given plugin.
 *
 * @param source The response for fetching the WASM plugin.
 * @param importFunctions The host functions that may be imported by the plugin.
 * @returns The functions that may be exported by the plugin.
 */
export async function createRuntime(
    source: Response | Promise<Response>,
    importFunctions: Imports
): Promise<Exports> {
    const promises = new Map<FatPtr, ((result: FatPtr) => void) | FatPtr>();

    function createAsyncValue(): FatPtr {
        const len = 12; // std::mem::size_of::<AsyncValue>()
        const fatPtr = malloc(len);
        const [ptr] = fromFatPtr(fatPtr);
        const buffer = new Uint8Array(memory.buffer, ptr, len);
        buffer.fill(0);
        return fatPtr;
    }

    function interpretSign(num: number, cap: number) {
        if (num < cap) {
            return num;
        } else {
            return num - (cap << 1);
        }
    }

    function interpretBigSign(num: bigint, cap: bigint) {
        if (num < cap) {
            return num;
        } else {
            return num - (cap << 1n);
        }
    }

    function parseObject<T>(fatPtr: FatPtr): T {
        const [ptr, len] = fromFatPtr(fatPtr);
        const buffer = new Uint8Array(memory.buffer, ptr, len);
        // Without creating a copy of the memory, we risk corruption of any
        // embedded `Uint8Array` objects returned from `decode()` after `free()`
        // has been called :(
        const copy = new Uint8Array(len);
        copy.set(buffer);
        free(fatPtr);
        const object = decode(copy) as unknown as T;
        return object;
    }

    function promiseFromPtr(ptr: FatPtr): Promise<FatPtr> {
        const resultPtr = promises.get(ptr);
        if (resultPtr) {
            if (typeof resultPtr === "function") {
                throw new FPRuntimeError("Already created promise for this value");
            }

            promises.delete(ptr);
            return Promise.resolve(resultPtr);
        } else {
            return new Promise((resolve) => {
                promises.set(ptr, resolve as (result: FatPtr) => void);
            });
        }
    }

    function resolvePromise(asyncValuePtr: FatPtr, resultPtr: FatPtr) {
        const resolve = promises.get(asyncValuePtr);
        if (resolve) {
            if (typeof resolve !== "function") {
                throw new FPRuntimeError("Tried to resolve invalid promise");
            }

            promises.delete(asyncValuePtr);
            resolve(resultPtr);
        } else {
            promises.set(asyncValuePtr, resultPtr);
        }
    }

    function serializeObject<T>(object: T): FatPtr {
        return exportToMemory(encode(object));
    }

    function exportToMemory(serialized: Uint8Array): FatPtr {
        const fatPtr = malloc(serialized.length);
        const [ptr, len] = fromFatPtr(fatPtr);
        const buffer = new Uint8Array(memory.buffer, ptr, len);
        buffer.set(serialized);
        return fatPtr;
    }

    function importFromMemory(fatPtr: FatPtr): Uint8Array {
        const [ptr, len] = fromFatPtr(fatPtr);
        const buffer = new Uint8Array(memory.buffer, ptr, len);
        const copy = new Uint8Array(len);
        copy.set(buffer);
        free(fatPtr);
        return copy;
    }

    const { instance } = await WebAssembly.instantiateStreaming(source, {
        fp: {
            __fp_gen_log: (message_ptr: FatPtr) => {
                const message = parseObject<string>(message_ptr);
                importFunctions.log(message);
            },
            __fp_gen_make_http_request: (request_ptr: FatPtr): FatPtr => {
                const request = parseObject<types.HttpRequest>(request_ptr);
                const _async_result_ptr = createAsyncValue();
                importFunctions.makeHttpRequest(request)
                    .then((result) => {
                        resolveFuture(_async_result_ptr, serializeObject(result));
                    })
                    .catch((error) => {
                        console.error(
                            'Unrecoverable exception trying to call async host function "make_http_request"',
                            error
                        );
                    });
                return _async_result_ptr;
            },
            __fp_gen_now: (): FatPtr => {
                return serializeObject(importFunctions.now());
            },
            __fp_gen_random: (len: number): FatPtr => {
                return serializeObject(importFunctions.random(len));
            },
            __fp_host_resolve_async_value: resolvePromise,
        },
    });

    const getExport = <T>(name: string): T => {
        const exp = instance.exports[name];
        if (!exp) {
            throw new FPRuntimeError(`Plugin did not export expected symbol: "${name}"`);
        }
        return exp as unknown as T;
    };

    const memory = getExport<WebAssembly.Memory>("memory");
    const malloc = getExport<(len: number) => FatPtr>("__fp_malloc");
    const free = getExport<(ptr: FatPtr) => void>("__fp_free");
    const resolveFuture = getExport<(asyncValuePtr: FatPtr, resultPtr: FatPtr) => void>("__fp_guest_resolve_async_value");

    return {
        createCells: (() => {
            const export_fn = instance.exports.__fp_gen_create_cells as any;
            if (!export_fn) return;

            return (queryType: string, response: types.Blob) => {
                const query_type_ptr = serializeObject(queryType);
                const response_ptr = serializeObject(response);
                return parseObject<types.Result<Array<types.Cell>, types.Error>>(export_fn(query_type_ptr, response_ptr));
            };
        })(),
        extractData: (() => {
            const export_fn = instance.exports.__fp_gen_extract_data as any;
            if (!export_fn) return;

            return (response: types.Blob, mimeType: string, query: string | null) => {
                const response_ptr = serializeObject(response);
                const mime_type_ptr = serializeObject(mimeType);
                const query_ptr = serializeObject(query);
                return parseObject<types.Result<types.Blob, types.Error>>(export_fn(response_ptr, mime_type_ptr, query_ptr));
            };
        })(),
        getConfigSchema: (() => {
            const export_fn = instance.exports.__fp_gen_get_config_schema as any;
            if (!export_fn) return;

            return () => parseObject<types.ConfigSchema>(export_fn());
        })(),
        getSupportedQueryTypes: (() => {
            const export_fn = instance.exports.__fp_gen_get_supported_query_types as any;
            if (!export_fn) return;

            return (config: types.ProviderConfig) => {
                const config_ptr = serializeObject(config);
                return promiseFromPtr(export_fn(config_ptr)).then((ptr) => parseObject<Array<types.SupportedQueryType>>(ptr));
            };
        })(),
        invoke2: (() => {
            const export_fn = instance.exports.__fp_gen_invoke2 as any;
            if (!export_fn) return;

            return (request: types.ProviderRequest) => {
                const request_ptr = serializeObject(request);
                return promiseFromPtr(export_fn(request_ptr)).then((ptr) => parseObject<types.Result<types.Blob, types.Error>>(ptr));
            };
        })(),
        createCellsRaw: (() => {
            const export_fn = instance.exports.__fp_gen_create_cells as any;
            if (!export_fn) return;

            return (queryType: Uint8Array, response: Uint8Array) => {
                const query_type_ptr = exportToMemory(queryType);
                const response_ptr = exportToMemory(response);
                return importFromMemory(export_fn(query_type_ptr, response_ptr));
            };
        })(),
        extractDataRaw: (() => {
            const export_fn = instance.exports.__fp_gen_extract_data as any;
            if (!export_fn) return;

            return (response: Uint8Array, mimeType: Uint8Array, query: Uint8Array) => {
                const response_ptr = exportToMemory(response);
                const mime_type_ptr = exportToMemory(mimeType);
                const query_ptr = exportToMemory(query);
                return importFromMemory(export_fn(response_ptr, mime_type_ptr, query_ptr));
            };
        })(),
        getConfigSchemaRaw: (() => {
            const export_fn = instance.exports.__fp_gen_get_config_schema as any;
            if (!export_fn) return;

            return () => importFromMemory(export_fn());
        })(),
        getSupportedQueryTypesRaw: (() => {
            const export_fn = instance.exports.__fp_gen_get_supported_query_types as any;
            if (!export_fn) return;

            return (config: Uint8Array) => {
                const config_ptr = exportToMemory(config);
                return promiseFromPtr(export_fn(config_ptr)).then(importFromMemory);
            };
        })(),
        invoke2Raw: (() => {
            const export_fn = instance.exports.__fp_gen_invoke2 as any;
            if (!export_fn) return;

            return (request: Uint8Array) => {
                const request_ptr = exportToMemory(request);
                return promiseFromPtr(export_fn(request_ptr)).then(importFromMemory);
            };
        })(),
    };
}

function fromFatPtr(fatPtr: FatPtr): [ptr: number, len: number] {
    return [Number(fatPtr >> 32n), Number(fatPtr & 0xffff_ffffn)];
}

function toFatPtr(ptr: number, len: number): FatPtr {
    return (BigInt(ptr) << 32n) | BigInt(len);
}
