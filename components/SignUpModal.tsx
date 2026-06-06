"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function openSignUpModal() {
  (document.getElementById("signup_modal") as HTMLDialogElement)?.showModal();
}

export default function SignUpModal() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirm = (form.elements.namedItem("confirm") as HTMLInputElement).value;

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      const { error } = await authClient.signUp.email({ email, password, name: email });
      if (error) {
        setError(error.message ?? "Sign up failed. Please try again.");
      } else {
        (document.getElementById("signup_modal") as HTMLDialogElement)?.close();
        router.refresh();
      }
    });
  }

  return (
    <dialog id="signup_modal" className="modal">
      <div className="modal-box">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>

        <h3 className="font-bold text-lg mb-6">Create an account</h3>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-base-content/70">Email</span>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              className="input input-bordered w-full"
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-base-content/70">Password</span>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              className="input input-bordered w-full"
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-base-content/70">Confirm password</span>
            <input
              type="password"
              name="confirm"
              placeholder="••••••••"
              className="input input-bordered w-full"
              required
            />
          </label>

          {error && (
            <p className="text-error text-sm" aria-live="polite">
              {error}
            </p>
          )}

          <button type="submit" className="btn btn-primary w-full mt-2" disabled={isPending}>
            {isPending ? <span className="loading loading-spinner loading-sm" /> : "Get started"}
          </button>
        </form>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
