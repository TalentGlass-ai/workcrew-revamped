"use client";
import * as React from "react";
import Image from "next/image";
import { Container, Button } from "../primitives";

const links = [
  { href: "#pricing", label: "Pricing" },
  { href: "#jobs", label: "Find jobs" },
  { href: "#blogs", label: "Blogs" },
  { href: "#about", label: "About us" },
  { href: "#contact", label: "Contact" },
];

const NAV_HEIGHT = 76; // keep this in sync with .row height

const NewNavbar: React.FC = () => {
  // add shadow when scrolled a bit
  React.useEffect(() => {
    const onScroll = () =>
      document.body.classList.toggle("scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Fixed header (always visible) */}
      <header className="wc-header" role="banner">
        <nav className="wc-nav" aria-label="Global">
          <Container>
            <div className="row">
              <a className="brand" href="/" aria-label="WorkCrew.ai">
                <span className="logoWrap">
                  <Image
                    src="/logo.png"
                    alt="WorkCrew.ai"
                    width={132}
                    height={28}
                    className="logo"
                    priority
                  />
                </span>
                <span className="brandFallback">
                  Work<span className="brand-pill">crew</span>.ai
                </span>
              </a>

              <ul className="menu">
                {links.map((l) => (
                  <li key={l.href}>
                    <a className="link" href={l.href}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="login">
                <Button className="login-btn">Login</Button>
              </div>
            </div>
          </Container>
        </nav>

        <style jsx>{`
          .wc-header {
            position: fixed;      /* <— fixed instead of sticky */
            top: 0;
            left: 0;
            right: 0;
            z-index: 60;
          }
          .wc-nav {
            background: rgba(255, 255, 255, 0.78);
            backdrop-filter: saturate(180%) blur(10px);
            -webkit-backdrop-filter: saturate(180%) blur(10px);
            border-bottom: 1px solid rgba(10, 15, 30, 0.08);
            transition: box-shadow 0.2s ease;
          }
          :global(body.scrolled) .wc-nav {
            box-shadow: 0 8px 24px rgba(15, 20, 40, 0.06);
          }

          .row {
            height: ${NAV_HEIGHT}px;
            display: grid;
            grid-template-columns: auto 1fr auto;
            align-items: center;
            gap: 24px;
          }

          .brand {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            text-decoration: none;
          }
          .logoWrap { display: inline-flex; }
          .logo { display: block; }
          .brandFallback { display: none; font-weight: 800; color: #0b1020; }
          .brand-pill {
            padding: 0 6px;
            border-radius: 6px;
            color: #fff;
            background: linear-gradient(135deg, #6d5cf5 0%, #3b82f6 100%);
          }
          /* if the image 404s, keep text visible */
          @supports not (background: paint(something)) {
            .logoWrap:has(img[aria-hidden="true"]) + .brandFallback { display: inline; }
          }

          .menu {
            justify-self: center;
            display: none;
            list-style: none;
            margin: 0;
            padding: 0;
            gap: 28px;
          }
          .link {
            text-decoration: none;
            color: #1b223f;
            font-weight: 500;
            opacity: 0.9;
          }
          .link:hover { opacity: 1; text-decoration: underline; }

          .login :global(.login-btn) {
            border-radius: 999px;
            padding: 10px 22px;
            font-weight: 700;
            color: #fff;
            background: radial-gradient(120% 120% at 20% 20%, #7c6cff 0%, #4f46e5 60%, #3b82f6 100%);
            box-shadow: 0 8px 24px rgba(99, 102, 241, 0.35), inset 0 0 0 1px rgba(255, 255, 255, 0.25);
          }

          @media (min-width: 768px) {
            .menu { display: inline-flex; }
          }
        `}</style>
      </header>

      {/* Spacer so page content doesn't sit under the fixed bar */}
      <div
        className="wc-nav-spacer"
        aria-hidden="true"
        style={{ height: NAV_HEIGHT }}
      />
    </>
  );
};

export default NewNavbar;
