/**
 * Unwraps a server action result of the shape `{ data }` or `{ error }`.
 *
 * Actions return failures instead of throwing (see app/actions/_shared.js), so
 * components can keep an ordinary try/catch: this turns `{ error }` back into a
 * thrown Error whose message is safe to show in a toast.
 */
export async function callAction(pending) {
  const result = await pending;
  if (!result) throw new Error("The server did not respond. Try again.");
  if (result.error) throw new Error(result.error);
  return result.data;
}
