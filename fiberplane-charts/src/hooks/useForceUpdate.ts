import { useReducer } from "react";

const reducer = (counter: number): number => counter + 1;

export function useForceUpdate(): () => void {
    const [, forceUpdate] = useReducer(reducer, 0);

    return forceUpdate;
}
