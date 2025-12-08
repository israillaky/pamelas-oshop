// src/contexts/useForbidden.ts
import { useContext } from "react";
import {
  ForbiddenContext,
  type ForbiddenContextValue,
} from "./ForbiddenContextBase";

export function useForbidden(): ForbiddenContextValue {
  const ctx = useContext(ForbiddenContext);
  if (!ctx) {
    throw new Error("useForbidden must be used within a ForbiddenProvider");
  }
  return ctx;
}
