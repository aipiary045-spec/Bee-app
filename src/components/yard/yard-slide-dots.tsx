"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  hiveSlideHint,
  hiveStripCanSlide,
  nearestHiveIndex,
} from "@/lib/yard-slide";

export function useYardSlide(itemCount: number) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canSlide, setCanSlide] = useState(false);
  const [hint, setHint] = useState({ moreLeft: false, moreRight: false });

  const measure = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    itemRefs.current.length = itemCount;
    setCanSlide(hiveStripCanSlide(el.scrollWidth, el.clientWidth));
    setHint(hiveSlideHint(el.scrollLeft, el.clientWidth, el.scrollWidth));
    const centers = itemRefs.current.map((node) =>
      node ? node.offsetLeft + node.offsetWidth / 2 : 0
    );
    setActiveIndex(nearestHiveIndex(el.scrollLeft + el.clientWidth / 2, centers));
  }, [itemCount]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, [itemCount, measure]);

  function scrollToIndex(index: number) {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    itemRefs.current[index]?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  }

  return { scrollerRef, itemRefs, activeIndex, canSlide, hint, scrollToIndex };
}

interface YardSlideDotsProps {
  labels: string[];
  activeIndex: number;
  onSelect: (index: number) => void;
  className?: string;
}

export function YardSlideDots({
  labels,
  activeIndex,
  onSelect,
  className,
}: YardSlideDotsProps) {
  if (labels.length < 2) return null;

  return (
    <div
      role="tablist"
      aria-label={`Hives on the stand, ${activeIndex + 1} of ${labels.length}`}
      className={cn(
        "flex max-w-[80%] flex-wrap items-center justify-center gap-1.5 rounded-full bg-[#1a2a14]/35 px-2.5 py-1.5 backdrop-blur-[2px]",
        className
      )}
    >
      {labels.map((label, index) => {
        const current = index === activeIndex;
        return (
          <button
            key={`${label}-${index}`}
            type="button"
            role="tab"
            aria-selected={current}
            aria-label={
              current ? `${label}, in view` : `Slide to ${label}`
            }
            onClick={() => onSelect(index)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              current
                ? "w-4 bg-[#ffe27a] shadow-[0_0_8px_rgba(255,226,122,0.55)]"
                : "w-1.5 bg-white/55 hover:bg-white/85"
            )}
          />
        );
      })}
    </div>
  );
}
