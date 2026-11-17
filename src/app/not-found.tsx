import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main id="main" className="grid min-h-[100dvh] place-items-center px-4 text-center">
      <div>
        <h1 className="text-5xl font-medium tracking-[-0.045em]">This page isn&apos;t here.</h1>
        <p className="mt-4 text-fg-2">The link may be old, or the page may have moved.</p>
        <div className="mt-8 flex justify-center">
          <Button href="/">Back to Phronem</Button>
        </div>
      </div>
    </main>
  );
}
