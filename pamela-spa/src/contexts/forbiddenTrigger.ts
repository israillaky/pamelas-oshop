// src/contexts/forbiddenTrigger.ts

export type ForbiddenTriggerFn = (message?: string) => void;

let handler: ForbiddenTriggerFn | null = null;

/**
 * Called by the provider to register/unregister its handler.
 */
export function registerForbiddenTrigger(fn: ForbiddenTriggerFn | null): void {
  handler = fn;
}

/**
 * Global function: call this from Axios, routes, etc.
 */
export function triggerForbidden(message?: string): void {
  if (handler) {
    handler(message);
  } else if (import.meta.env.DEV) {
    console.warn(
      "[Forbidden] triggerForbidden called but no handler is registered (is ForbiddenProvider mounted?)."
    );
  }
}
