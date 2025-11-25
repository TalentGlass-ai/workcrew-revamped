"use client";

import * as React from "react";
import { motion } from "framer-motion";

type FadeWrapperProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

export default function FadeWrapper({
  children,
  className = "",
  delay = 0,
}: FadeWrapperProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: "easeOut",
        delay,
      }}
      viewport={{
        once: true,      // animate only the first time it comes into view
        amount: 0.2,     // 20% of the section must be visible to trigger
      }}
    >
      {children}
    </motion.div>
  );
}
