import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { listAccounts } from "./accounts";
import type { Operator } from "./types";

/**
 * Operator sessions: a signed, HttpOnly cookie holding the username and an expiry, scoped to
 * /operators. Signed with HMAC-SHA256 using OPERATOR_SESSION_SECRET. Every check also confirms the
 * account still exists and is active, so disabling an operator ends their session at once.
 *
 * This file is the desk's data-access gate: pages call requireOperator(), and every server action
 * calls it again before touching data (proxy.ts only does a quick cookie-presence redirect).
 */

export const SESSION_COOKIE = "phronem_operator";
export const SIGN_IN_PATH = "/operators/sign-in";
const SESSION_HOURS = 10;

let devSecret: string | null = null;

function secret(): string {
  const s = process.env.OPERATOR_SESSION_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("OPERATOR_SESSION_SECRET must be set (32+ characters) to sign operators in.");
  }
  // Development without a secret: a random one per server start (sessions end on restart).
  devSecret ??= randomBytes(32).toString("hex");
  return devSecret;
}

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

export function createSessionValue(username: string) {
  const payload = Buffer.from(JSON.stringify({ u: username, exp: Date.now() + SESSION_HOURS * 3600_000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function readSessionValue(value: string | undefined): string | null {
  if (!value) return null;
  const [payload, mac] = value.split(".");
  if (!payload || !mac) return null;
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(mac);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const { u, exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { u: string; exp: number };
    return typeof u === "string" && typeof exp === "number" && exp > Date.now() ? u : null;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/operators",
  maxAge: SESSION_HOURS * 3600,
};

/** The signed-in operator for this request, or null. Memoised for one render pass. */
export const getOperator = cache(async (): Promise<Operator | null> => {
  const store = await cookies();
  const username = readSessionValue(store.get(SESSION_COOKIE)?.value);
  if (!username) return null;
  const account = (await listAccounts()).find((a) => a.username === username);
  return account?.active ? { username: account.username, name: account.name } : null;
});

/** The signed-in operator, or a redirect to the sign-in page. */
export async function requireOperator(): Promise<Operator> {
  const operator = await getOperator();
  if (!operator) redirect(SIGN_IN_PATH);
  return operator;
}
