import { promises as fs } from "node:fs";
import path from "node:path";
import { SAMPLE_DATA } from "./seed";
import type { DeskData } from "./types";

/**
 * File-backed store for the qualification desk: one JSON document in DESK_DATA_DIR (default
 * `.data/` in the project, which git ignores). Every change goes through `mutate`, which takes a
 * lock, reads the latest file, applies the change and writes it back atomically (temp file, then
 * rename), so a crash mid-write never leaves a half-written register.
 *
 * Fits one server process with a persistent disk. Before running several instances or a
 * serverless host, move this to a database (the functions below are the whole interface).
 */

export const DATA_DIR = process.env.DESK_DATA_DIR ? path.resolve(process.env.DESK_DATA_DIR) : path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "desk.json");

let lock: Promise<unknown> = Promise.resolve();

/** Run `fn` with no other write in progress in this process. */
export function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = lock.then(fn, fn);
  lock = run.catch(() => undefined);
  return run;
}

export async function writeJsonAtomic(file: string, value: unknown) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(value, null, 1), { encoding: "utf8", mode: 0o600 });
  await fs.rename(tmp, file);
}

function normalise(d: Partial<DeskData>): DeskData {
  return { experts: d.experts ?? {}, matches: d.matches ?? {}, evals: d.evals ?? {}, audit: d.audit ?? [] };
}

async function readFile(): Promise<DeskData> {
  try {
    return normalise(JSON.parse(await fs.readFile(FILE, "utf8")));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    // First run: start with the fictional sample experts so the desk isn't empty.
    const seeded = structuredClone(SAMPLE_DATA);
    await writeJsonAtomic(FILE, seeded);
    return seeded;
  }
}

/** The whole register, freshly read. Treat it as read-only. */
export function readDesk(): Promise<DeskData> {
  return withLock(readFile);
}

/** Apply a change to the register and save it. `fn` mutates the draft and may return a value. */
export function mutate<T>(fn: (draft: DeskData) => T): Promise<T> {
  return withLock(async () => {
    const draft = await readFile();
    const result = fn(draft);
    await writeJsonAtomic(FILE, draft);
    return result;
  });
}
