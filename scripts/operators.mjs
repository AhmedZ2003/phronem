#!/usr/bin/env node
/**
 * Manage operator accounts for the qualification desk (/operators).
 *
 *   pnpm operators list
 *   pnpm operators add <username> "<Display name>"     asks for a password
 *   pnpm operators reset <username>                    asks for a new password
 *   pnpm operators disable <username>                  signs them out and blocks sign-in
 *   pnpm operators enable <username>
 *
 * Accounts live in <DESK_DATA_DIR>/operators.json (default .data/operators.json). Passwords are
 * stored as scrypt hashes only, in the same format as src/lib/desk/accounts.ts. Accounts are
 * disabled rather than deleted, so the audit trail keeps naming who did what.
 */
import { randomBytes, scryptSync } from "node:crypto";
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import readline from "node:readline";

const DIR = process.env.DESK_DATA_DIR ? path.resolve(process.env.DESK_DATA_DIR) : path.join(process.cwd(), ".data");
const FILE = path.join(DIR, "operators.json");
const USERNAME = /^[a-z0-9_.-]{3,32}$/;

function load() {
  try {
    return JSON.parse(readFileSync(FILE, "utf8"));
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

function save(accounts) {
  mkdirSync(DIR, { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(accounts, null, 1), { mode: 0o600 });
  renameSync(tmp, FILE);
}

function hash(password) {
  const salt = randomBytes(16).toString("hex");
  return { salt, hash: scryptSync(password, salt, 64).toString("hex") };
}

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (s) => {
      if (s.includes(question)) process.stdout.write(s);
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
  });
}

async function newPassword() {
  const a = await askHidden("Password (12+ characters): ");
  if (a.length < 12) fail("Use at least 12 characters.");
  const b = await askHidden("Repeat the password: ");
  if (a !== b) fail("The two passwords don't match.");
  return a;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

const [cmd, rawUser, ...rest] = process.argv.slice(2);
const accounts = load();
const username = rawUser?.trim().toLowerCase();
const find = () => accounts.find((a) => a.username === username) ?? fail(`No operator called ${username}.`);

switch (cmd) {
  case "list":
  case undefined:
    if (!accounts.length) console.log("No operator accounts yet. The first one is created from SEED_OPERATOR_* when the desk starts.");
    for (const a of accounts) console.log(`${a.username.padEnd(20)} ${a.name.padEnd(28)} ${a.active ? "active" : "disabled"}`);
    break;
  case "add": {
    if (!username || !USERNAME.test(username)) fail("Usernames are 3 to 32 characters: lowercase letters, digits, _ . or -");
    if (accounts.some((a) => a.username === username)) fail(`${username} already exists. Use reset to change the password.`);
    const name = rest.join(" ").trim() || username;
    accounts.push({ username, name, ...hash(await newPassword()), active: true, createdAt: new Date().toISOString() });
    save(accounts);
    console.log(`Added ${username} (${name}).`);
    break;
  }
  case "reset": {
    const a = find();
    Object.assign(a, hash(await newPassword()));
    save(accounts);
    console.log(`Password changed for ${username}.`);
    break;
  }
  case "disable":
  case "enable": {
    const a = find();
    a.active = cmd === "enable";
    save(accounts);
    console.log(`${username} is now ${a.active ? "active" : "disabled"}.`);
    break;
  }
  default:
    fail("Commands: list, add <username> \"<Display name>\", reset <username>, disable <username>, enable <username>");
}
