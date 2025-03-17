import type { UseAgentOptions } from "agents-sdk/react";
import { useCallback } from "react";
import { useAgent as useSDKAgent } from "agents-sdk/react";

type OnStateUpdate<T> = NonNullable<UseAgentOptions<T>["onStateUpdate"]>;
type OnClose<T> = NonNullable<UseAgentOptions<T>["onClose"]>;

export function useAgent<T = unknown>(options: UseAgentOptions) {
	const onStateUpdate = useCallback<OnStateUpdate<T>>(
		(state, source) => {
			const captureArguments: OnStateUpdate<T> = (state, source) => {
				console.log("state", state, "source", source);
			};

			const fn = options.onStateUpdate
				? captureFunction<OnStateUpdate<T>>({
						fn: options.onStateUpdate,
						arguments: captureArguments,
					})
				: captureArguments;

			return fn(state, source);
		},
		[options.onStateUpdate],
	);

	const onClose = useCallback<OnClose<T>>(
		(event) => {
			const captureArguments: OnClose<T> = (event) => {
				console.log("close", event);
			};

			const fn = options.onClose
				? captureFunction<OnClose<T>>({
						fn: options.onClose,
						arguments: captureArguments,
					})
				: captureArguments;

			return fn(event);
		},
		[options.onClose],
	);

	const newOptions = {
		...options,
		onStateUpdate,
		onClose,
	};

	return useSDKAgent(newOptions);
}

// biome-ignore lint/suspicious/noExplicitAny: needed to mute some typing shenanigans
function captureFunction<T extends (...args: any[]) => unknown>({
	fn,
	arguments: before,
	returnValue: after,
}: {
	fn: T;
	arguments?: (...args: Parameters<T>) => void;
	returnValue?: (result: ReturnType<T>) => void;
}) {
	return (...args: Parameters<T>) => {
		before?.(...args);

		const result = fn.apply(null, args) as ReturnType<T>;

		if (after) {
			after(result);
		}

		return result;
	};
}
