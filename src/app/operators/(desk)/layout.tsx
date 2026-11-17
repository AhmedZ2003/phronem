import { DeskShell } from "@/components/desk/DeskShell";
import { requireOperator } from "@/lib/desk/session";

/** Every desk screen needs a signed-in operator. The shell (sidebar and top bar) names who is working. */
export default async function DeskLayout({ children }: { children: React.ReactNode }) {
  const operator = await requireOperator();
  return <DeskShell operator={operator}>{children}</DeskShell>;
}
