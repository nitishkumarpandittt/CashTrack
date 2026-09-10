// Shared plumbing for the server actions in this folder. Not a "use server"
// file itself: those may only export async functions, and this exports a class
// and a couple of helpers.

import { auth, currentUser } from "@clerk/nextjs/server";
import { describeDbError } from "@/utils/dbErrors";

/** A failure with a message that is safe and useful to show the user as-is. */
export class ActionError extends Error {}

/**
 * Clerk profile per user id, remembered for a while on this server instance.
 * `auth()` verifies the session token locally in a millisecond or two, but
 * `currentUser()` is a round trip to Clerk's API on every call; with several
 * actions per page that was hundreds of milliseconds each, every time.
 */
const PROFILE_TTL_MS = 10 * 60 * 1000;
const profiles = new Map();

function pickEmail(user) {
  return (
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses?.find((entry) => entry.id === user.primaryEmailAddressId)?.emailAddress ??
    user.emailAddresses?.[0]?.emailAddress ??
    ""
  );
}

/**
 * The signed-in user's email, which is what every row is keyed on, plus their
 * first name. Resolved on the server from the Clerk session, so a caller
 * cannot read or write another account's rows by sending a different address.
 */
export async function requireProfile() {
  const { userId, sessionClaims } = await auth();
  if (!userId) throw new ActionError("Your session has expired. Sign in again.");

  const cached = profiles.get(userId);
  if (cached && cached.expires > Date.now()) return cached;

  // A session token customised in the Clerk dashboard to carry the email
  // avoids the API call entirely; otherwise fetch the user once and remember.
  let email = typeof sessionClaims?.email === "string" ? sessionClaims.email : "";
  let firstName = typeof sessionClaims?.firstName === "string" ? sessionClaims.firstName : "";
  if (!email) {
    const user = await currentUser();
    if (!user) throw new ActionError("Your session has expired. Sign in again.");
    email = pickEmail(user);
    firstName = user.firstName?.trim() || "";
  }

  if (!email) {
    throw new ActionError(
      "Your account has no email address on file. Add one to your account, then try again."
    );
  }

  const profile = { email, firstName, expires: Date.now() + PROFILE_TTL_MS };
  profiles.set(userId, profile);
  return profile;
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
