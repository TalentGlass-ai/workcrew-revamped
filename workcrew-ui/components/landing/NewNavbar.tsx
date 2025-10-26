// PATH: /workcrew-ui/components/landing/NewNavbar.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import LayeredPill from "../primitives/buttons/LayeredPill";

// main nav config
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

  React.useEffect(() => {
    const onScroll = () =>
      document.body.classList.toggle("scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return pathname === "/";
    return pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
  };

  const goLogin = () => router.push("/login");

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
              <span className="brandFallback">
                Work<span className="brand-pill">crew</span>.ai
              </span>
            </Link>

            {/* main navigation */}
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

            {/* login */}
            <div className="login">
              <LayeredPill label="Login" size="sm" onClick={goLogin} />
            </div>
          </div>
        </nav>

        <style jsx>{`
          /* smooth scrolling */
          :global(html) {
            scroll-behavior: smooth;
          }
          /* ensure content starts below fixed header */
          :global(body) {
            padding-top: ${NAV_HEIGHT}px;
          }
          /* anchor offsets */
          :global([id]) {
            scroll-margin-top: ${ANCHOR_OFFSET}px;
          }
          :global(#contact) {
            scroll-margin-top: ${ANCHOR_OFFSET}px;
          }

          /* fixed header, always full width */
          .wc-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 60;
            height: ${NAV_HEIGHT}px;
            transition: box-shadow 0.3s ease, transform 0.2s ease;
          }
          /* floated state: keep edge-to-edge rectangle (no inset, no pill) */
          :global(body.scrolled) .wc-header {
            top: 0;
            left: 0;
            right: 0;
          }

          /* glass background card — rectangular in both states */
          .wc-nav {
            position: relative;
            height: 100%;
            overflow: hidden;
            background: transparent;
            backdrop-filter: blur(14px) saturate(140%);
            -webkit-backdrop-filter: blur(14px) saturate(140%);
            border: 1.5px solid rgba(163, 157, 255, 0.11);
            box-shadow: 0 4px 10px rgba(16, 22, 40, 0.08);
            transition: box-shadow 0.3s ease;
            border-radius: 0; /* keep rectangular */
          }
          :global(body.scrolled) .wc-nav {
            border-radius: 0;
            box-shadow: 0 8px 18px rgba(16, 22, 40, 0.12);
          }

          .wc-nav::before,
          .wc-nav::after {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: inherit;
            pointer-events: none;
          }
          .wc-nav::before {
            background: linear-gradient(
              180deg,
              rgba(246, 247, 252, 0.95) 0%,
              rgba(236, 239, 248, 0.92) 100%
            );
          }
          .wc-nav::after {
            background-image: linear-gradient(
                rgba(163, 157, 255, 0.22) 1px,
                transparent 1px
              ),
              linear-gradient(
                90deg,
                rgba(163, 157, 255, 0.22) 1px,
                transparent 1px
              );
            background-size: 40px 40px;
            opacity: 0.26;
          }

          /* grid */
          .row {
            position: relative;
            z-index: 1;
            height: ${NAV_HEIGHT}px;
            display: grid;
            grid-template-columns: auto 1fr auto;
            align-items: center;
            padding: 0 20px;
          }

          /* brand */
          .brand {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            text-decoration: none;
            justify-self: start;
          }
          .logo {
            display: block;
          }
          .brandFallback {
            display: none;
            font-weight: 800;
            color: #1c2140;
          }
          .brand-pill {
            padding: 0 6px;
            border-radius: 6px;
            color: #fff;
            background: linear-gradient(135deg, #6d5cf5 0%, #3b82f6 100%);
          }

          /* center menu */
          .menu {
            justify-self: center;
            display: none;
            list-style: none;
            margin: 0;
            padding: 0;
            gap: 36px;
          }
          @media (min-width: 768px) {
            .menu {
              display: inline-flex;
            }
          }

          /* links */
          .link {
            text-decoration: none;
            color: #1c2140;
            font-weight: 550;
            letter-spacing: 0.005em;
            transition: color 0.25s ease, transform 0.2s ease;
          }
          .menu :global(a.link:hover),
          .menu :global(a.link:focus-visible) {
            color: #2563eb !important;
          }
          .link:hover {
            transform: translateY(-1px);
          }
          .link.active {
            color: #3b82f6;
            text-decoration: underline;
          }
          .link.active:hover {
            color: #2563eb !important;
            text-decoration: underline;
          }

          /* login container */
          .login {
            justify-self: end;
          }
          /* make login pill 1.75× wider */
          .login :global(button) {
            padding-inline: 28px !important; /* wider pill */
          }
          .login :global(button:focus),
          .login :global(button:focus-visible) {
            outline: none !important;
            box-shadow: none !important;
          }
        `}</style>
      </header>
    </>
  );
};

export default NewNavbar;
