"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export interface Look {
  id: string;
  image: string;
  title: string;
  description: string;
}

// Fallback image in case of loading error (a clean SVG inline placeholder for M&A standard elegance)
const FALLBACK_IMAGE_DATA = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='360' height='480' viewBox='0 0 360 480' style='background:%23E8E4E1;'><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%23C5A059'>Billede ikke tilgængeligt</text></svg>";

export function Carousel({ looks = [] }: { looks?: Look[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!looks || looks.length === 0 || !containerRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            if (!isNaN(index)) {
              setActiveIndex(index);
            }
          }
        });
      },
      { root: containerRef.current, rootMargin: "0px -50% 0px -50%", threshold: 0 }
    );

    const children = containerRef.current.querySelectorAll(".carousel-item");
    children.forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, [looks]);

  // Zero-Trust Safe Degradation: Empty look list handling
  if (!looks || looks.length === 0) {
    return (
      <div className="w-full h-[50vh] flex flex-col items-center justify-center border border-dashed border-foreground/10 rounded-sm my-8 p-8 text-center bg-surface/20">
        <p className="text-sm tracking-widest uppercase text-foreground/60 mb-2">Lookbook Tom</p>
        <p className="text-xs text-foreground/40 max-w-xs">Vi kunne ikke indlæse dagens kollektion. Prøv venligst igen senere.</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex overflow-x-auto snap-x snap-mandatory w-full h-[70vh] min-h-[500px] items-center gap-8 px-[50vw] box-border"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {looks.map((look, index) => {
        if (!look) return null;
        
        const id = look.id || `look-${index}`;
        const title = look.title || "Unavngivet Look";
        const description = look.description || "Ingen beskrivelse tilgængelig.";
        const hasError = imageErrors[id];
        const imageUrl = hasError ? FALLBACK_IMAGE_DATA : (look.image || FALLBACK_IMAGE_DATA);
        const isActive = index === activeIndex;

        return (
          <motion.div
            key={id}
            data-index={index}
            className="carousel-item snap-center shrink-0 w-[280px] sm:w-[360px] h-[80%] flex flex-col justify-center"
            animate={{
              scale: isActive ? 1 : 0.9,
              opacity: isActive ? 1 : 0.4,
            }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            style={{ 
              marginLeft: index === 0 ? "calc(-140px)" : "0", 
              marginRight: index === looks.length - 1 ? "calc(-140px)" : "0" 
            }}
          >
            <div className="w-full h-full relative overflow-hidden bg-surface rounded-sm shadow-inner">
              {/* Use Next.js Image component with zero-trust safety wrapper */}
              <Image 
                src={imageUrl} 
                alt={title} 
                fill
                sizes="(max-width: 640px) 280px, 360px"
                className="object-cover"
                priority={index === 0}
                onError={() => {
                  setImageErrors(prev => ({ ...prev, [id]: true }));
                }}
              />
            </div>
            <motion.div 
              className="mt-6 text-center"
              animate={{ opacity: isActive ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg tracking-widest font-medium mb-2 uppercase">{title}</h3>
              <p className="text-sm text-foreground/60 leading-relaxed">{description}</p>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
