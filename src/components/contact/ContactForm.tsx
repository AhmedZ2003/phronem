"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowUpRight, CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { contactPage, site } from "@/content/site";
import { limits, validateContact, type ContactAudience, type ContactErrors } from "@/lib/contact";
import { cn } from "@/lib/cn";

type Status = "idle" | "sending" | "sent" | "error";

/**
 * The contact form, after IDR's contact page: three large tabs (Clients / Experts / Learn more)
 * over one form card. Each tab changes the intro and the enquiry label; the fields stay the same
 * (name, email, phone, enquiry, consent). Validated here and again on the server; a hidden
 * "website" field catches bots. Sends JSON to /api/contact.
 */
export function ContactForm() {
  const c = contactPage;
  const [tab, setTab] = useState<ContactAudience>("clients");

  // Links can open a given tab: /contact?type=experts (the "Start a conversation" buttons do)
  useEffect(() => {
    const type = new URLSearchParams(window.location.search).get("type");
    const match = c.tabs.find((t) => t.id === type);
    if (match) queueMicrotask(() => setTab(match.id as ContactAudience));
  }, [c.tabs]);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const formRef = useRef<HTMLFormElement>(null);
  const uid = useId();
  const active = c.tabs.find((t) => t.id === tab) ?? c.tabs[0];

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      audience: tab,
      name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone"),
      enquiry: form.get("enquiry"),
      consent: form.get("consent") === "on",
    };
    const result = validateContact(data);
    if (!result.ok) {
      setErrors(result.errors);
      const first = Object.keys(result.errors)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setErrors({});
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...result.value, website: form.get("website") }),
      });
      if (res.ok) {
        setStatus("sent");
        return;
      }
      const body = (await res.json().catch(() => null)) as { errors?: ContactErrors } | null;
      if (res.status === 400 && body?.errors) {
        setErrors(body.errors);
        setStatus("idle");
        return;
      }
      setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  const field = (name: keyof typeof c.fields | "enquiry") => ({
    id: `${uid}-${name}`,
    name,
    "aria-invalid": errors[name as keyof ContactErrors] ? true : undefined,
    "aria-describedby": errors[name as keyof ContactErrors] ? `${uid}-${name}-error` : undefined,
    onChange: () => errors[name as keyof ContactErrors] && setErrors((prev) => ({ ...prev, [name]: undefined })),
  });

  const inputClass =
    "w-full rounded-[12px] border border-line bg-ink-2 px-4 py-3 text-[15px] text-fg placeholder:text-fg-3 transition-colors focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/30 aria-[invalid=true]:border-[rgb(var(--icon-ember-rgb))]";

  const fieldError = (name: keyof ContactErrors) =>
    errors[name] ? (
      <p id={`${uid}-${name}-error`} className="mt-1.5 flex items-center gap-1.5 text-[13px] text-[rgb(var(--icon-ember-rgb))]">
        <WarningCircle aria-hidden weight="fill" className="size-4 shrink-0" />
        {errors[name]}
      </p>
    ) : null;

  return (
    <div>
      {/* Who you are: three large tabs */}
      <div role="tablist" aria-label="I am contacting Phronem as" className="mx-auto grid max-w-[820px] grid-cols-3 gap-2 sm:gap-4">
        {c.tabs.map((t) => (
          <button
            key={t.id}
            id={`${uid}-tab-${t.id}`}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            aria-controls={`${uid}-panel`}
            onClick={() => {
              setTab(t.id as ContactAudience);
              setErrors({});
              if (status !== "sending") setStatus("idle");
            }}
            className={cn(
              "rounded-[var(--radius-control)] border px-2 py-4 text-[15px] font-semibold transition-colors sm:py-6 sm:text-lg",
              tab === t.id ? "border-fg bg-button text-ink" : "border-line-strong bg-glass text-fg hover:border-fg-3",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* The form card, in the GlowCard edge */}
      <div
        id={`${uid}-panel`}
        role="tabpanel"
        aria-labelledby={`${uid}-tab-${tab}`}
        className="mx-auto mt-8 max-w-[820px] rounded-[25px] p-[1.3px]"
        style={{ background: "linear-gradient(126deg, var(--card-edge), var(--card-edge-end) 50%)" }}
      >
        <div className="relative overflow-hidden rounded-[24px] bg-[var(--card-body)] px-5 py-8 sm:px-10 sm:py-10">
          <div aria-hidden className="absolute -left-8 -top-8 size-[97px] rounded-full bg-signal opacity-25" style={{ filter: "blur(78px)" }} />

          {status === "sent" ? (
            <div role="status" className="relative flex flex-col items-center py-10 text-center">
              <CheckCircle aria-hidden weight="fill" className="size-12 text-signal" />
              <h2 className="mt-5 text-2xl font-medium tracking-[-0.02em] text-fg">{c.sent.title}</h2>
              <p className="mt-2 max-w-[40ch] text-[15px] text-fg-2">{c.sent.text}</p>
            </div>
          ) : (
            <form ref={formRef} noValidate onSubmit={onSubmit} className="relative">
              <p className="text-[15px] leading-relaxed text-fg">{active.intro}</p>
              {"introNote" in active && active.introNote && (
                <p className="mt-2 text-[15px] leading-relaxed text-fg-2">
                  {active.introNote}{" "}
                  {"introLink" in active && active.introLink && (
                    <a href={active.introLink.href} className="text-signal underline underline-offset-4">
                      {active.introLink.label}
                    </a>
                  )}
                </p>
              )}

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor={`${uid}-name`} className="mb-1.5 block text-sm font-medium text-fg">
                    {c.fields.name}
                  </label>
                  <input {...field("name")} type="text" autoComplete="name" maxLength={limits.name} required className={inputClass} />
                  {fieldError("name")}
                </div>
                <div>
                  <label htmlFor={`${uid}-email`} className="mb-1.5 block text-sm font-medium text-fg">
                    {c.fields.email}
                  </label>
                  <input {...field("email")} type="email" autoComplete="email" inputMode="email" maxLength={limits.email} required className={inputClass} />
                  {fieldError("email")}
                </div>
                <div>
                  <label htmlFor={`${uid}-phone`} className="mb-1.5 block text-sm font-medium text-fg">
                    {c.fields.phone}
                  </label>
                  <input {...field("phone")} type="tel" autoComplete="tel" inputMode="tel" maxLength={limits.phone} required className={inputClass} />
                  {fieldError("phone")}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor={`${uid}-enquiry`} className="mb-1.5 block text-sm font-medium text-fg">
                    {active.enquiryLabel}
                  </label>
                  <textarea
                    {...field("enquiry")}
                    rows={6}
                    maxLength={limits.enquiry}
                    required
                    placeholder={active.enquiryHint}
                    className={cn(inputClass, "resize-y")}
                  />
                  {fieldError("enquiry")}
                </div>
              </div>

              {/* Bots fill this in; people never see it */}
              <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label>
                  Website
                  <input name="website" type="text" tabIndex={-1} autoComplete="off" />
                </label>
              </div>

              <div className="mt-6">
                <label className="flex cursor-pointer items-start gap-3 text-[15px] text-fg-2">
                  <input
                    {...field("consent")}
                    type="checkbox"
                    className="mt-0.5 size-5 shrink-0 cursor-pointer rounded-[5px] accent-[var(--color-signal)]"
                  />
                  <span>{c.fields.consent}</span>
                </label>
                {fieldError("consent")}
              </div>

              {status === "error" && (
                <p role="alert" className="mt-6 rounded-[12px] border border-[rgb(var(--icon-ember-rgb)/0.4)] bg-[rgb(var(--icon-ember-rgb)/0.08)] px-4 py-3 text-[15px] text-fg">
                  {c.error}{" "}
                  <a href={`mailto:${site.email}`} className="text-signal underline underline-offset-4">
                    {site.email}
                  </a>
                  .
                </p>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-button px-6 py-3.5 text-[15px] font-semibold text-ink transition-colors hover:bg-fg/85 disabled:cursor-wait disabled:opacity-70 sm:w-auto"
              >
                {status === "sending" ? c.sending : c.submit}
                <ArrowUpRight aria-hidden weight="bold" className="size-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
