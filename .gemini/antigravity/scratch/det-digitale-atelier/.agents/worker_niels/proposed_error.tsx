"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an external logging service (e.g. Sentry / Datadog in production M&A standard)
    console.error("System Error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-md w-full bg-surface border border-foreground/5 p-8 rounded-sm shadow-md flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-6 text-accent animate-pulse">
          <AlertTriangle className="w-6 h-6" strokeWidth={1.5} />
        </div>
        
        <h2 className="text-xl tracking-widest font-light uppercase text-foreground mb-3">
          Noget gik galt
        </h2>
        
        <p className="text-sm text-foreground/60 leading-relaxed mb-6">
          Der opstod en uventet fejl i Det Digitale Atelier. Vi arbejder på at løse problemet hurtigst muligt.
        </p>

        {error.digest && (
          <div className="w-full text-left bg-background/50 p-3 rounded-sm border border-foreground/5 font-mono text-[10px] text-foreground/40 mb-6 truncate">
            Digest ID: {error.digest}
          </div>
        )}

        <button
          onClick={() => reset()}
          className="w-full py-3 bg-accent text-background hover:bg-accent/90 transition-all flex items-center justify-center gap-2 text-xs tracking-widest uppercase font-medium rounded-sm cursor-pointer shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          Genindlæs Applikation
        </button>
      </div>
    </div>
  );
}
