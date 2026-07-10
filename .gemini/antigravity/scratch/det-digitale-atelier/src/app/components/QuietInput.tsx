"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export function QuietInput({ onSubmit }: { onSubmit: (val: string) => void }) {
  const [value, setValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && value.trim() !== "") {
      onSubmit(value.trim());
      setValue("");
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto py-8">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Beskriv din silhuet-præference..."
        className="w-full bg-transparent border-b border-foreground/20 text-foreground text-lg py-2 focus:outline-none focus:border-accent placeholder:text-foreground/50 transition-colors duration-quiet ease-quiet"
      />
    </div>
  );
}
