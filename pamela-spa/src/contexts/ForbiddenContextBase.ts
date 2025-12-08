// src/contexts/ForbiddenContextBase.ts
import { createContext } from "react";

export type ForbiddenContextValue = {
  forbiddenOpen: boolean;
  message: string | null;
  clearForbidden: () => void;
};

export const ForbiddenContext = createContext<ForbiddenContextValue | undefined>(
  undefined
);
