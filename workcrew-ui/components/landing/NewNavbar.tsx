// PATH: /workcrew-ui/components/landing/NewNavbar.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../primitives";

// Centralized Nav Links
const links = [
  { href: "/", label: "Home" },
  { href: "/find-jobs", label: "Find jobs" },
  { href: "/pricing", label: "Pricing" },
  // { href: "/blogs", label: "Blogs" }, // 🔸 Commented out: old internal blogs link
  { href: "https://blog.workcrew.ai/", label: "Blogs", external: true }, // 🔹 New external blogs link
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact" },
];

const NAV_HEIGHT = 76;

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

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href + "/"));

  // handle login navigation
  const handleLoginClick = () => {
    router.push("/login");
  };

  return (
    <>
      <header className="wc-header" role="banner">
        <nav className="wc-nav" aria-label="Global">
          <div className="row">
            {/* LHS brand */}
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

            {/* Center menu */}
            <ul className="menu">
              {links.map((l) => (
                <li key={l.href}>
                  {l.external ? (
                    // 🔹 Open external blogs link in new tab
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link"
                    >
                      {l.label}
                    </a>
                  ) : (
                    <Link
                      href={l.href}
                      prefetch
                      className={`link ${isActive(l.href) ? "active" : ""}`}
                      aria-current={isActive(l.href) ? "page" : undefined}
                    >
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            {/* RHS login */}
            <div className="login">
              <Button
                className="login-btn"
                type="button"
                onClick={handleLoginClick}
              >
                Login
              </Button>
            </div>
          </div>
        </nav>

        <style jsx>{`
          /* =================== HEADER =================== */
          .wc-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 60;
            height: ${NAV_HEIGHT}px;
            transition: all 0.3s ease;
          }
          :global(body.scrolled) .wc-header {
            top: 16px;
            left: 8px;
            right: 8px;
          }
          @media (min-width: 640px) {
            :global(body.scrolled) .wc-header {
              left: 12px;
              right: 12px;
            }
          }
          @media (min-width: 768px) {
            :global(body.scrolled) .wc-header {
              left: 16px;
              right: 16px;
            }
          }
          @media (min-width: 1024px) {
            :global(body.scrolled) .wc-header {
              left: 20px;
              right: 20px;
            }
          }
          @media (min-width: 1280px) {
            :global(body.scrolled) .wc-header {
              left: 24px;
              right: 24px;
            }
          }
          @media (min-width: 1536px) {
            :global(body.scrolled) .wc-header {
              left: 32px;
              right: 32px;
            }
          }

          /* =================== NAV SURFACE =================== */
          .wc-nav {
            position: relative;
            height: 100%;
            overflow: hidden;
            background: transparent;
            backdrop-filter: blur(14px) saturate(140%);
            -webkit-backdrop-filter: blur(14px) saturate(140%);
            border-radius: 0;
            border: 1.5px solid rgba(163, 157, 255, 0.11);
            box-shadow: 0 12px 36px rgba(16, 22, 40, 0.18);
            transition: border-radius 0.3s ease;
          }
          :global(body.scrolled) .wc-nav {
            border-radius: 9999px;
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

          /* =================== CONTENT =================== */
          .row {
            position: relative;
            z-index: 1;
            height: ${NAV_HEIGHT}px;
            display: grid;
            grid-template-columns: auto 1fr auto;
            align-items: center;
            padding: 0 20px;
          }

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

          .menu {
            justify-self: center;
            display: none;
            list-style: none;
            margin: 0;
            padding: 0;
            gap: 36px;
          }
          .link {
            text-decoration: none;
            color: #1c2140;
            font-weight: 550;
            letter-spacing: 0.005em;
            transition: color 0.2s ease;
          }
          .link:hover {
            text-decoration: underline;
          }
          .link.active {
            color: #3b6af7;
            text-decoration: underline;
          }
          @media (min-width: 768px) {
            .menu {
              display: inline-flex;
            }
          }

          /* =================== LOGIN BUTTON =================== */
          .login {
            justify-self: end;
          }
          .login :global(.login-btn) {
            position: relative !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            height: 40px !important;
            min-width: 120px !important;
            padding: 0 22px !important;
            border-radius: 24px !important;
            color: #fff !important;
            font-weight: 700 !important;
            line-height: 1 !important;
            text-decoration: none !important;
            white-space: nowrap !important;
            cursor: pointer !important;
            background: linear-gradient(135deg, #4d31ec 0%, #3b6af7 100%) !important;
            box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.25),
              0 8px 22px rgba(61, 79, 255, 0.23),
              0 0 0 7px rgba(196, 211, 239, 0.52),
              0 0 0 14px rgba(196, 211, 239, 0.28) !important;
          }
          .login :global(.login-btn:active) {
            transform: translateY(1px);
          }
          @media (hover: hover) {
            .login :global(.login-btn:hover) {
              filter: brightness(1.02);
            }
          }
        `}</style>
      </header>

      {/* Spacer */}
      <div
        className="wc-nav-spacer"
        aria-hidden="true"
        style={{ height: NAV_HEIGHT }}
      />
    </>
  );
};

export default NewNavbar;
