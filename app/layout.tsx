import "./globals.css";
import * as React from "react";
import { Schibsted_Grotesk, Archivo, Manrope } from "next/font/google";
import "./globals.css";

const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  // Use the variable axis so we can set 540 via CSS
  weight: "variable", // allowed: 400|500|600|700|800|900|variable
});

const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  // Archivo supports full range
  weight: ["100","200","300","400","500","600","700","800","900"],
});

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-alt",
  // Manrope supports: 200–800 (and variable on some cuts)
  weight: ["200","300","400","500","600","700","800"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${schibsted.variable} ${archivo.variable} ${manrope.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
