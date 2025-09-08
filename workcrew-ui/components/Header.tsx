// components/Header.tsx
'use client';

import Link from "next/link";
import ProfileChip from "./ProfileChip";

export default function Header() {
  return (
    <header className="wc-header">
      <div className="wc-header-wrap">
        <div className="wc-header-tab">
          <div className="wc-row">
            {/* Left: Logo + Nav + small profile shimmer chip */}
            <div className="wc-left">
              <div className="wc-logo">
                Work<b className="wc-accent">crew</b><sup>.ai</sup>
              </div>

              <nav className="wc-nav">
                <Link href="#">Pricing</Link>
                <Link href="#">Find jobs</Link>
                <Link href="#">Blogs</Link>
                <Link href="#">About us</Link>
                <Link href="#">Contact</Link>
              </nav>

              {/* mini card: lady + shimmer lines */}
              <div className="wc-chip-wrap">
                <ProfileChip />
              </div>
            </div>

            {/* Right: Login button with exact figma size */}
            <Link href="#" className="wc-login">Login</Link>
          </div>
        </div>
      </div>
    </header>
  );
}
