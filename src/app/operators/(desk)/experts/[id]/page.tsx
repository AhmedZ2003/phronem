import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadBundle } from "@/app/operators/actions";
import { ExpertFile } from "@/components/desk/file/ExpertFile";
import { displayName } from "@/lib/desk/rules";
import { requireOperator } from "@/lib/desk/session";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ section?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const bundle = await loadBundle(id);
  return { title: bundle ? displayName(bundle.expert) : "Expert file" };
}

export default async function ExpertFilePage({ params, searchParams }: Props) {
  const operator = await requireOperator();
  const [{ id }, { section }] = await Promise.all([params, searchParams]);
  const bundle = await loadBundle(id);
  if (!bundle) notFound();
  return <ExpertFile key={id} initial={bundle} operator={operator} initialSection={section} />;
}
