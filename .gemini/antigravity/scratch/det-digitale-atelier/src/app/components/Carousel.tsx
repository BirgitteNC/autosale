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

export function Carousel({ looks }: { looks: Look[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Intentionally removed unused scroll handler to avoid dead code
    };
    
    // Better: use IntersectionObserver to detect which item is in the center.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            setActiveIndex(index);
          }
        });
      },
      { root: containerRef.current, rootMargin: "0px -50% 0px -50%", threshold: 0 }
    );

    const children = containerRef.current?.querySelectorAll(".carousel-item");
    children?.forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, [looks]);

  return (
    <div 
      ref={containerRef}
      className="flex overflow-x-auto snap-x snap-mandatory w-full h-[70vh] min-h-[500px] items-center gap-8 box-border scroll-px-4 px-[calc(50vw-140px)] sm:px-[calc(50vw-180px)]"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {/* Dynamic padding ensures the first and last items snap perfectly to center on both mobile and desktop */}
      {looks.map((look, index) => {
        const isActive = index === activeIndex;
        return (
          <motion.div
            key={look.id}
            data-index={index}
            className="carousel-item snap-center shrink-0 w-[280px] sm:w-[360px] h-[80%] flex flex-col justify-center"
            animate={{
              scale: isActive ? 1 : 0.9,
              opacity: isActive ? 1 : 0.4,
            }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            // Removed hardcoded margin offsets that caused the 40px desktop bug
          >
            <div className="w-full h-full relative overflow-hidden bg-surface rounded-sm shadow-inner">
              <Image 
                src={look.image} 
                alt={look.title} 
                fill
                sizes="(max-width: 640px) 280px, 360px"
                className="object-cover" 
                priority={index === 0}
              />
            </div>
            <motion.div 
              className="mt-6 text-center"
              animate={{ opacity: isActive ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg tracking-widest font-medium mb-2 uppercase">{look.title}</h3>
              <p className="text-sm text-foreground/60 leading-relaxed">{look.description}</p>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
