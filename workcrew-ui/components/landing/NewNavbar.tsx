// PATH: /workcrew-ui/components/landing/NewNavbar.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link"; // kept for brand link
import { usePathname, useRouter } from "next/navigation";
import LayeredPill from "../primitives/buttons/LayeredPill";

const links = [
  { href: "/", label: "Home" },
  { href: "/find-jobs", label: "Find jobs" },
  { href: "/pricing", label: "Pricing" },
  { href: "https://blog.workcrew.ai/", label: "Blogs", external: true },
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

  const handleLoginClick = () => router.push("/login");

  return (
    <>
      <header className="wc-header" role="banner">
        <nav className="wc-nav" aria-label="Global">
          <div className="row">
            {/* Brand */}
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

            {/* Center Links */}
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
                  ) : (
                    <a
                      href={l.href}
                      className={`link ${isActive(l.href) ? "active" : ""}`}
                      aria-current={isActive(l.href) ? "page" : undefined}
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(l.href);
                      }}
                    >
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>

            {/* Login pill */}
            <div className="login">
              <LayeredPill
                label="Login"
                size="sm"
                onClick={handleLoginClick}
                className="
                  [&>*]:w-[195px]
                  [&>*>*]:w-[180px]
                  [&>*>*>*]:w-[170px]
                  [&>*>*>*]:!min-w-[170px]
                  [&>*>*>*]:!max-w-[170px]
                  [&>*>*>*]:!h-[40px]
                  [&>*>*>*]:!px-0
                  [&>*>*>*]:!py-0
                  [&>*>*>*]:!justify-center
                "
              />
            </div>
          </div>
        </nav>

        <style jsx>{`
          /* HEADER */
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

          /* NAV */
          .wc-nav {
            position: relative;
            height: 100%;
            overflow: hidden;
            background: transparent;
            backdrop-filter: blur(14px) saturate(140%);
            -webkit-backdrop-filter: blur(14px) saturate(140%);
            border: 1.5px solid rgba(163, 157, 255, 0.11);
            box-shadow: 0 4px 10px rgba(16, 22, 40, 0.08);
            transition: border-radius 0.3s ease, box-shadow 0.3s ease;
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

          /* ROW */
          .row {
            position: relative;
            z-index: 1;
            height: ${NAV_HEIGHT}px;
            display: grid;
            grid-template-columns: auto 1fr auto;
            align-items: center;
            padding: 0 20px;
          }

          /* BRAND */
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

          /* MENU */
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

          /* LINKS */
          .link {
            text-decoration: none;
            color: #1c2140;
            font-weight: 550;
            letter-spacing: 0.005em;
            transition: color 0.25s ease, transform 0.2s ease;
          }

          /* Hard override so ALL anchors turn blue on hover */
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

          /* LOGIN */
          .login {
            justify-self: end;
          }
          .login :global(button:focus),
          .login :global(button:focus-visible) {
            outline: none !important;
            box-shadow: none !important;
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
