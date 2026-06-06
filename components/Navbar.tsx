"use client";

import SignInModal, { openSignInModal } from "./SignInModal";

export default function Navbar() {
  return (
    <div className="navbar bg-base-100 shadow-sm sticky top-0 z-50">
      <div className="w-full max-w-6xl mx-auto flex">
        <div className="navbar-start">
          <a className="btn btn-ghost text-xl tracking-tight font-semibold">
            Museum Collage
          </a>
        </div>
        <div className="navbar-end gap-1">
          <a className="btn btn-ghost">Explore</a>
          <a className="btn btn-ghost">My Board</a>
          <button className="btn btn-primary ml-2" onClick={openSignInModal}>
            Sign in
          </button>
        </div>
      </div>

      <SignInModal />
    </div>
  );
}
