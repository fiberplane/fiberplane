import { createContext } from "react";

export const AuthContext = createContext<[{} | undefined, (user: {}) => void]>([
  undefined,
  () => {},
]);
