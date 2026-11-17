"use client";

import { createContext, useContext } from "react";
import type { ActionResult } from "@/app/operators/actions";
import type { ExpertBundle, Operator } from "@/lib/desk/types";

export type FileCtx = {
  bundle: ExpertBundle;
  operator: Operator;
  /** Run a server action and take the updated file it returns. Resolves true when saved. */
  run: (action: () => Promise<ActionResult>) => Promise<boolean>;
  /** The display name for an operator username. */
  who: (username?: string) => string;
};

export const FileContext = createContext<FileCtx | null>(null);

export function useFile(): FileCtx {
  const ctx = useContext(FileContext);
  if (!ctx) throw new Error("useFile must be used inside an expert file");
  return ctx;
}
