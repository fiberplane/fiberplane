import type { UseAgentOptions } from "agents-sdk/react";
import { useCallback } from "react";
import { useAgent as useSDKAgent } from "agents-sdk/react";

export function useAgent<T = unknown>(options: UseAgentOptions) {
	type OnStateUpdate = NonNullable<UseAgentOptions<T>["onStateUpdate"]>;
	const onStateUpdate = useCallback<OnStateUpdate>(
		(state, source) => {
			const captureArguments: OnStateUpdate = (state, source) => {
				console.log("state", state, "source", source);
			};

			return options.onStateUpdate
				? captureFunction<OnStateUpdate>({
						fn: options.onStateUpdate,
						arguments: captureArguments,
					})(state, source)
				: undefined;
		},
		[options.onStateUpdate],
	);

	// const onClose = options.onClose ? captureFunction(options.onClose) : undefined;

	const newOptions = {
		...options,
		onStateUpdate,
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
