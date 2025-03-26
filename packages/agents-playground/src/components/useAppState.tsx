// import { unset } from "@/types";
// import { useCallback, useReducer } from "react";

// type State = {
//   selectedAgent: string | typeof unset;
//   selectedInstance: string | typeof unset;
// };

// const initialState: State = {
//   selectedAgent: unset as string | typeof unset,
//   selectedInstance: unset as string | typeof unset,
// };

// type Action =
//   | { type: "reset" }
//   | { type: "setAgent"; agent: string }
//   | { type: "setInstance"; instance: string; agent: string };

// export function useAppState() {
//   const [state, dispatch] = useReducer(agentInstanceReducer, initialState);

//   const setSelectedAgent = useCallback((agent: string) => {
//     dispatch({ type: "setAgent", agent });
//   }, []);

//   const setSelectedAgentInstance = useCallback(
//     (agent: string, instance: string) => {
//       dispatch({ type: "setInstance", instance, agent });
//     },
//     [],
//   );
//   const reset = useCallback(() => {
//     dispatch({ type: "reset" });
//   }, []);

//   return {
//     state,
//     setSelectedAgent,
//     setSelectedAgentInstance,
//     reset,
//   };
// }

// function agentInstanceReducer(state: State, action: Action): State {
//   switch (action.type) {
//     case "reset":
//       return initialState;
//     case "setAgent":
//       return {
//         ...state,
//         selectedAgent: action.agent,
//         selectedInstance: unset,
//       };
//     case "setInstance":
//       return {
//         ...state,
//         selectedAgent: action.agent,
//         selectedInstance: action.instance,
//       };
//     default:
//       return state;
//   }
// }
