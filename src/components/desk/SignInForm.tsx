"use client";

import { useActionState, useState } from "react";
import { Eye, EyeSlash, SignIn, WarningCircle } from "@phosphor-icons/react";
import { signIn, type SignInState } from "@/app/operators/actions";

const initial: SignInState = { error: "", username: "" };

/** Username and password, with a show-password toggle. Paste and password managers both work. */
export function SignInForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signIn, initial);
  const [show, setShow] = useState(false);

  return (
    <form action={action} className="mt-7 flex flex-col gap-5" noValidate>
      <input type="hidden" name="next" value={next} />

      {state.error && (
        <p role="alert" className="chip chip--bad w-full whitespace-normal px-3 py-2.5 text-[13.5px]">
          <WarningCircle aria-hidden weight="bold" className="size-4 shrink-0" />
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="username" className="text-[13px] font-semibold text-fg-2">
          Username
        </label>
        <input
          id="username"
          name="username"
          className="desk-input"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          defaultValue={state.username}
          required
          aria-invalid={!!state.error}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-[13px] font-semibold text-fg-2">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            className="desk-input pr-12"
            autoComplete="current-password"
            required
            aria-invalid={!!state.error}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            aria-pressed={show}
            className="absolute inset-y-0 right-1 grid w-10 place-items-center rounded-[10px] text-fg-2 hover:text-fg"
          >
            {show ? <EyeSlash aria-hidden weight="bold" className="size-[18px]" /> : <Eye aria-hidden weight="bold" className="size-[18px]" />}
          </button>
        </div>
      </div>

      <button type="submit" className="desk-btn desk-btn--primary mt-1 w-full py-3 text-[15px]" disabled={pending}>
        <SignIn aria-hidden weight="bold" className="size-[18px]" />
        {pending ? "Signing in" : "Sign in"}
      </button>
    </form>
  );
}
