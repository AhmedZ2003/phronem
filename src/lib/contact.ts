/**
 * The contact form's data and its validation, shared by the form (src/components/contact/ContactForm.tsx)
 * and the endpoint (src/app/api/contact/route.ts) so both apply the same rules.
 */
export const audiences = ["clients", "experts", "learn-more"] as const;
export type ContactAudience = (typeof audiences)[number];

export type ContactInput = {
  audience: ContactAudience;
  name: string;
  email: string;
  phone: string;
  enquiry: string;
  consent: boolean;
};

export type ContactErrors = Partial<Record<"name" | "email" | "phone" | "enquiry" | "consent", string>>;

export const limits = { name: 120, email: 200, phone: 40, enquiry: 4000 } as const;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Digits with the usual separators and an optional leading +; 7 to 20 digits in all.
const PHONE = /^\+?[\d\s().-]+$/;

export function validateContact(input: Partial<Record<keyof ContactInput, unknown>>): { ok: true; value: ContactInput } | { ok: false; errors: ContactErrors } {
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const value: ContactInput = {
    audience: audiences.includes(input.audience as ContactAudience) ? (input.audience as ContactAudience) : "clients",
    name: str(input.name),
    email: str(input.email),
    phone: str(input.phone),
    enquiry: str(input.enquiry),
    consent: input.consent === true,
  };

  const errors: ContactErrors = {};
  if (!value.name) errors.name = "Please enter your name.";
  else if (value.name.length > limits.name) errors.name = "Please shorten your name.";

  if (!value.email) errors.email = "Please enter your email address.";
  else if (value.email.length > limits.email || !EMAIL.test(value.email)) errors.email = "Please enter a valid email address.";

  const digits = value.phone.replace(/\D/g, "").length;
  if (!value.phone) errors.phone = "Please enter your phone number.";
  else if (value.phone.length > limits.phone || !PHONE.test(value.phone) || digits < 7 || digits > 20) errors.phone = "Please enter a valid phone number.";

  if (!value.enquiry) errors.enquiry = "Please tell us about your enquiry.";
  else if (value.enquiry.length > limits.enquiry) errors.enquiry = `Please keep it under ${limits.enquiry} characters.`;

  if (!value.consent) errors.consent = "Please confirm we may use these details to reply.";

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value };
}
