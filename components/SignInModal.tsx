"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function openSignInModal() {
  (document.getElementById("signin_modal") as HTMLDialogElement)?.showModal();
}

export default function SignInModal() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    startTransition(async () => {
      const { error } = await authClient.signIn.email({ email, password });
      if (error) {
        setError(error.message ?? "Sign in failed. Please try again.");
      } else {
        (document.getElementById("signin_modal") as HTMLDialogElement)?.close();
        router.refresh();
      }
    });
  }

  return (
    <dialog id="signin_modal" className="modal">
      <div className="modal-box">
        <form method="dialog">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </form>

        <h3 className="font-bold text-lg mb-6">Sign in</h3>

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

          {error && (
            <p className="text-error text-sm" aria-live="polite">
              {error}
            </p>
          )}

          <button type="submit" className="btn btn-primary w-full mt-2" disabled={isPending}>
            {isPending ? <span className="loading loading-spinner loading-sm" /> : "Sign in"}
          </button>
        </form>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
