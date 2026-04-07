// app/layout.tsx
import "./globals.css";
import { Schibsted_Grotesk, Archivo } from "next/font/google";
import Image from "next/image";
import * as React from "react";

const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-schibsted",
  weight: "variable",
});

const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archivo",
  weight: "variable",
});

import { Toaster } from "sonner";
import { Providers } from "./Providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${schibsted.variable} ${archivo.variable}`}>
      <body>
        <Providers>
          <Toaster position="top-center" />
          {/* Page content */}
          {children}

        {/* ✅ Floating Chatbot visible on all pages */}
        <button
          aria-label="Chatbot"
          className="fixed z-50 right-6 bottom-6 md:right-8 md:bottom-8 
                     rounded-full ring-[3px] ring-[#4D31EC] 
                     shadow-[0_10px_30px_rgba(77,49,236,0.25)] 
                     overflow-hidden hover:scale-[1.03] active:scale-[0.98] transition"
        >
          <Image
            src="/Rah.png"
            alt="Assistant"
            width={64}
            height={64}
            className="w-[64px] h-[64px] object-cover"
            priority
          />
        </button>
        </Providers>
      </body>
    </html>
  );
}
