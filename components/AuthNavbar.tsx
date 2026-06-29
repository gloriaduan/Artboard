"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import styles from "./AuthNavbar.module.css";

type User = {
  name: string;
  email: string;
  image?: string | null;
};

export default function AuthNavbar({ user }: { user: User }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleSignOut() {
    await authClient.signOut();
    router.refresh();
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          Museum Collage
        </Link>
        <div
          className={styles.menuAnchor}
          onBlur={(e) => {
            // Close when focus leaves the whole menu subtree.
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setMenuOpen(false);
            }
          }}
        >
          <button
            type="button"
            className={styles.avatarButton}
            aria-label={`Account menu for ${user.name}`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <div className={styles.avatar}>
              {user.image ? (
                <img className={styles.avatarImg} src={user.image} alt="" />
              ) : (
                <div className={styles.avatarInitials} aria-hidden="true">
                  {initials}
                </div>
              )}
            </div>
          </button>
          <ul
            className={styles.dropdown}
            data-open={menuOpen || undefined}
            role="menu"
          >
            <li role="presentation">
              <span className={styles.dropdownEmail}>{user.email}</span>
            </li>
            <li role="presentation">
              <Link
                href="/saved"
                role="menuitem"
                className={styles.dropdownItem}
              >
                Saved Artworks
              </Link>
            </li>
            <li role="presentation">
              <Link
                href="/boards"
                role="menuitem"
                className={styles.dropdownItem}
              >
                My Boards
              </Link>
            </li>
            <li role="presentation">
              <button
                type="button"
                role="menuitem"
                onClick={handleSignOut}
                className={styles.dropdownItemDanger}
              >
                Sign out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
