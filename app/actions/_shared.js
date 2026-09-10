// Shared plumbing for the server actions in this folder. Not a "use server"
// file itself: those may only export async functions, and this exports a class
// and a couple of helpers.

import { currentUser } from "@clerk/nextjs/server";
import { describeDbError } from "@/utils/dbErrors";

/** A failure with a message that is safe and useful to show the user as-is. */
export class ActionError extends Error {}

/**
 * The signed-in user's email, which is what every row is keyed on. Resolved
 * on the server from the Clerk session, so a caller cannot read or write
 * another account's rows by sending a different address.
 */
export async function requireProfile() {
  const user = await currentUser();
  if (!user) throw new ActionError("Your session has expired. Sign in again.");

  const email =
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses?.find((entry) => entry.id === user.primaryEmailAddressId)?.emailAddress ??
    user.emailAddresses?.[0]?.emailAddress;

  if (!email) {
    throw new ActionError(
      "Your account has no email address on file. Add one to your account, then try again."
    );
  }
  return { email, firstName: user.firstName?.trim() || "" };
}

export async function requireEmail() {
  return (await requireProfile()).email;
}

/**
 * Runs an action body and always resolves to `{ data }` or `{ error }`.
 *
 * Thrown errors are not passed through on purpose: in production Next replaces
 * a server action's error message with an opaque digest, which would put the
 * generic "something went wrong" toast right back. Returning the message keeps
 * the database's own explanation visible in the UI.
 */
export async function run(work) {
  try {
    return { data: await work() };
  } catch (error) {
    if (error instanceof ActionError) return { error: error.message };
    console.error("[server action]", error);
    return { error: describeDbError(error) };
  }
}

export function requireText(value, label) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new ActionError(`${label} is required.`);
  if (text.length > 120) throw new ActionError(`${label} must be 120 characters or fewer.`);
  return text;
}

export function requireAmount(value, label = "Amount") {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new ActionError(`${label} must be a number greater than zero.`);
  }
  // Budgets and incomes store amounts as text; expenses as numeric. A plain
  // decimal string satisfies both without floating-point artefacts.
  return String(amount);
}

export function requireId(value, label = "id") {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new ActionError(`Invalid ${label}.`);
  return id;
}

export function optionalIcon(value) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, 16) : "😀";
}
