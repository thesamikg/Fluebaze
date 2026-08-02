export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export function safeErrorMessage(context: string) {
  return `We couldn’t ${context}. Please try again.`;
}
