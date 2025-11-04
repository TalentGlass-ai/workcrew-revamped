// PATH: /workcrew-ui/components/landing/NewNavbar.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import LayeredPill from "../primitives/buttons/LayeredPill";

const links = [
  { href: "/", label: "Home" },
  { href: "/find-jobs", label: "Find jobs" },
  { href: "/pricing", label: "Pricing" },
  { href: "https://blog.workcrew.ai/", label: "Blogs", external: true },
  { href: "/about", label: "About us" },
  { href: "/#contact", label: "Contact", isAnchor: true },
];

const NAV_HEIGHT = 76;
const ANCHOR_OFFSET = NAV_HEIGHT + 16;

const NewNavbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [profileImg, setProfileImg] = React.useState<string | null>(null);
  const profileRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const onScroll = () =>
      document.body.classList.toggle("scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    if (!isProfileOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileOpen]);

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return pathname === "/";
    return pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
  };

  const goLogin = () => router.push("/login");

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsProfileOpen(false);
    router.push("/");
  };

  const handleProfileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setProfileImg(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleContactOnHome = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== "/") return;
    e.preventDefault();
    const el = document.getElementById("contact");
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - ANCHOR_OFFSET;
      window.scrollTo({ top: Math.max(y, 0), behavior: "smooth" });
      history.replaceState(null, "", "/#contact");
    }
  };

  return (
    <>
      <header className="wc-header" role="banner">
        <nav className="wc-nav" aria-label="Global">
          <div className="row">
            {/* brand */}
            <Link className="brand" href="/" aria-label="WorkCrew.ai">
              <Image
                src="/logo.png"
                alt="WorkCrew.ai"
                width={132}
                height={28}
                className="logo"
                priority
              />
            </Link>

            {/* main nav */}
            <ul className="menu">
              {links.map((l) => (
                <li key={l.href}>
                  {l.external ? (
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link"
                    >
                      {l.label}
                    </a>
                  ) : l.isAnchor ? (
                    <Link
                      href={l.href}
                      className={`link ${isActive(l.href) ? "active" : ""}`}
                      aria-current={isActive(l.href) ? "page" : undefined}
                      onClick={handleContactOnHome}
                    >
                      {l.label}
                    </Link>
                  ) : (
                    <Link
                      href={l.href}
                      className={`link ${isActive(l.href) ? "active" : ""}`}
                      aria-current={isActive(l.href) ? "page" : undefined}
                    >
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            {/* login + profile */}
            <div className="login">
              {/* Login button */}
              <LayeredPill label="Login" size="sm" onClick={goLogin} />

              {/* Profile icon + dropdown */}
              <div className="profileWrapper" ref={profileRef}>
                <button
                  type="button"
                  className="profileButton"
                  onClick={() => setIsProfileOpen((v) => !v)}
                >
                  <span className="avatarCircle">
                    {profileImg ? (
                      <Image
                        src={profileImg}
                        alt="Profile"
                        width={36}
                        height={36}
                        className="avatarImage"
                      />
                    ) : (
                      <svg viewBox="0 0 24 24" className="avatarIcon">
                        <circle cx="12" cy="9" r="3.2" />
                        <path d="M5.5 19.2c1.4-3 3.3-4.5 6.5-4.5s5.1 1.5 6.5 4.5" />
                      </svg>
                    )}
                  </span>
                </button>

                {isProfileOpen && (
                  <div className="profileMenu" role="menu">
                    <label className="profileMenuItem">
                      Edit profile
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileUpload}
                        style={{ display: "none" }}
                      />
                    </label>

                    {profileImg && (
                      <button
                        type="button"
                        className="profileMenuItem"
                        onClick={() => setProfileImg(null)}
                      >
                        Remove profile
                      </button>
                    )}

                    <button
                      type="button"
                      className="profileMenuItem logout"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        <style jsx>{`
          :global(body) {
            padding-top: ${NAV_HEIGHT}px;
          }

          .wc-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 60;
            height: ${NAV_HEIGHT}px;
          }

          .wc-nav {
            position: relative;
            height: 100%;
            backdrop-filter: blur(14px) saturate(140%);
            border: 1.5px solid rgba(163, 157, 255, 0.11);
            background: rgba(255, 255, 255, 0.9);
          }

          .row {
            height: ${NAV_HEIGHT}px;
            display: grid;
            grid-template-columns: auto 1fr auto;
            align-items: center;
            padding: 0 20px;
          }

          .menu {
            justify-self: center;
            display: none;
            list-style: none;
            gap: 36px;
          }

          @media (min-width: 768px) {
            .menu {
              display: inline-flex;
            }
          }

          .link {
            text-decoration: none;
            color: #1c2140;
            font-weight: 550;
            transition: color 0.25s;
          }

          /* login group – shifted 40px right, 25px gap */
          .login {
            display: flex;
            align-items: center;
            gap: 25px;
            transform: translateX(30px); /* moves both login + profile 40px right */
          }

          /* make login pill at least 160px long and move it 40px more (total 80px) */
          .login :global(button:first-of-type) {
            min-width: 160px;
            padding-inline: 10px !important;
            justify-content: center;
            transform: translateX(30px); /* extra 40px → 80px total from original */
          }

          .profileWrapper {
            position: relative;
          }

          .profileButton {
            border: none;
            background: transparent;
            padding: 0;
            cursor: pointer;
          }

          .avatarCircle {
            width: 38px;
            height: 38px;
            border-radius: 9999px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #ffffff;
            border: 2.5px solid #4f46e5; /* blue circle stroke */
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
            overflow: hidden;
          }

          .avatarImage {
            object-fit: cover;
            border-radius: 9999px;
          }

          .avatarIcon {
            width: 20px;
            height: 20px;
            fill: none;
            stroke: #1f2937;
            stroke-width: 1.6;
          }

          .profileMenu {
            position: absolute;
            right: 0;
            margin-top: 10px;
            background: #fff;
            border: 1px solid rgba(147, 163, 255, 0.35);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
            border-radius: 12px;
            padding: 8px 0;
            min-width: 170px;
            z-index: 100;
          }

          .profileMenuItem {
            display: block;
            width: 100%;
            text-align: left;
            padding: 10px 16px;
            font-size: 0.9rem;
            background: none;
            border: none;
            cursor: pointer;
            color: #111827;
            transition: background 0.15s;
          }

          .profileMenuItem:hover {
            background: rgba(226, 232, 255, 0.6);
          }

          .logout {
            color: #dc2626;
          }

          .logout:hover {
            background: rgba(254, 226, 226, 0.9);
          }
        `}</style>
      </header>
    </>
  );
};

export default NewNavbar;
