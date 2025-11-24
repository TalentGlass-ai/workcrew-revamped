// PATH: app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Schibsted_Grotesk, Archivo } from "next/font/google";
import * as React from "react";

const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "WorkCrew.ai",
  description:
    "WorkCrew.ai – AI-powered recruitment platform to help you hire better, faster.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${schibsted.variable} ${archivo.variable}`}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
