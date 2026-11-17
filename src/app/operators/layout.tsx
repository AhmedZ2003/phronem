import type { Metadata } from "next";
import "./desk.css";

export const metadata: Metadata = {
  title: { default: "Operators | Phronem", template: "%s | Phronem operators" },
  robots: { index: false, follow: false },
};

/** The operator area: the expert qualification desk and its sign-in page. Not part of the public site. */
export default function OperatorsLayout({ children }: { children: React.ReactNode }) {
  return <div className="desk min-h-[100dvh]">{children}</div>;
}
