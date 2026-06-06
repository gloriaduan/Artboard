"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import styles from "./AuthNavbar.module.css";

type User = {
  name: string;
  email: string;
  image?: string | null;
};

export default function AuthNavbar({ user }: { user: User }) {
  const router = useRouter();

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
        <a className={styles.logo}>Museum Collage</a>

        <label className={styles.search}>
          <svg className={styles.searchIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </g>
          </svg>
          <input className={styles.searchInput} type="search" placeholder="Search artworks, artists..." />
        </label>

        <div className={styles.menuAnchor}>
          <button tabIndex={0} className={styles.avatarButton}>
            <div className={styles.avatar}>
              {user.image ? (
                <img className={styles.avatarImg} src={user.image} alt={user.name} />
              ) : (
                <div className={styles.avatarInitials}>{initials}</div>
              )}
            </div>
          </button>
          <ul className={styles.dropdown}>
            <li>
              <span className={styles.dropdownEmail}>{user.email}</span>
            </li>
            <li><a className={styles.dropdownItem}>Profile</a></li>
            <li><a className={styles.dropdownItem}>Settings</a></li>
            <li>
              <button onClick={handleSignOut} className={styles.dropdownItemDanger}>
                Sign out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
