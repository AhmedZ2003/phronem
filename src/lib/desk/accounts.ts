import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { DATA_DIR, withLock, writeJsonAtomic } from "./store";
import type { OperatorAccount } from "./types";

/**
 * Operator accounts, one per person, in `<DESK_DATA_DIR>/operators.json`. Passwords are stored
 * only as scrypt hashes with a per-account salt.
 *
 * On first run the file is created with the account named in SEED_OPERATOR_USERNAME /
 * SEED_OPERATOR_PASSWORD / SEED_OPERATOR_NAME (see .env.example). Add, disable or reset accounts
 * with `pnpm operators` (scripts/operators.mjs), which uses the same hash format.
 */

const FILE = path.join(DATA_DIR, "operators.json");
const KEY_LENGTH = 64;

export const USERNAME_PATTERN = /^[a-z0-9_.-]{3,32}$/;

export function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  return { salt, hash: scryptSync(password, salt, KEY_LENGTH).toString("hex") };
}

function passwordMatches(account: OperatorAccount, password: string) {
  const expected = Buffer.from(account.hash, "hex");
  const actual = scryptSync(password, account.salt, KEY_LENGTH);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

async function readAccounts(): Promise<OperatorAccount[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as OperatorAccount[];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    const username = process.env.SEED_OPERATOR_USERNAME?.trim().toLowerCase();
    const password = process.env.SEED_OPERATOR_PASSWORD;
    if (!username || !password || !USERNAME_PATTERN.test(username)) return [];
    const seeded: OperatorAccount[] = [
      {
        username,
        name: process.env.SEED_OPERATOR_NAME?.trim() || username,
        ...hashPassword(password),
        active: true,
        createdAt: new Date().toISOString(),
      },
    ];
    await writeJsonAtomic(FILE, seeded);
    return seeded;
  }
}

export function listAccounts() {
  return withLock(readAccounts);
}

/** The account for these credentials, or null. Always runs one hash, so timing doesn't reveal usernames. */
export async function checkCredentials(username: string, password: string): Promise<OperatorAccount | null> {
  const accounts = await listAccounts();
  const account = accounts.find((a) => a.username === username.trim().toLowerCase());
  if (!account) {
    hashPassword(password, "0".repeat(32));
    return null;
  }
  return account.active && passwordMatches(account, password) ? account : null;
}

/** Display names for every operator, keyed by username. "sample" marks the fictional records. */
export async function operatorNames(): Promise<Record<string, string>> {
  const accounts = await listAccounts();
  return { sample: "Sample data", ...Object.fromEntries(accounts.map((a) => [a.username, a.name])) };
}
