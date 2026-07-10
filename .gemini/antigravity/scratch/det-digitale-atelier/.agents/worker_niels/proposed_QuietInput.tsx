"use client";

import { useState } from "react";
import { Search } from "lucide-react";

interface QuietInputProps {
  onSubmit?: (val: string) => void;
}

export function QuietInput({ onSubmit = () => {} }: QuietInputProps) {
  const [value, setValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      submitValue();
    }
  };

  const submitValue = () => {
    const trimmed = value.trim();
    if (trimmed !== "") {
      // Defensive check: Limit query size to prevent excessive processing/abuse
      const sanitized = trimmed.substring(0, 100); 
      onSubmit(sanitized);
      setValue("");
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto py-8">
      <div className="relative flex items-center border-b border-foreground/20 focus-within:border-accent transition-colors duration-quiet ease-quiet">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={100}
          placeholder="Beskriv din silhuet-præference..."
          className="w-full bg-transparent text-foreground text-lg py-2 pr-10 focus:outline-none placeholder:text-foreground/50"
        />
        <button
          onClick={submitValue}
          disabled={value.trim() === ""}
          className="absolute right-0 p-2 text-foreground/50 hover:text-accent disabled:opacity-30 disabled:hover:text-foreground/50 transition-colors cursor-pointer"
          aria-label="Søg efter styling råd"
        >
          <Search className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
