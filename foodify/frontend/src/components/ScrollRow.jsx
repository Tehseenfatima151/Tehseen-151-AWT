import { useRef, useState, useEffect, useLayoutEffect, useCallback } from "react";

/**
 * ScrollRow — wraps any horizontal scroll list with floating ‹ › arrow buttons.
 * Arrows remain stable if scrollable, disabling when at boundaries.
 *
 * Props:
 *   className    – extra classes forwarded to the inner scroll div (gaps, padding, etc.)
 *   scrollAmount – px to scroll per arrow click (default 340)
 *   children     – the list items
 */
const ScrollRow = ({ children, className = "", scrollAmount = 340 }) => {
  const rowRef = useRef(null);
  const [canLeft,  setCL] = useState(false);
  const [canRight, setCR] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);

  // ── Determine scroll boundaries and scrollability ────────────────────────
  const sync = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    
    // Check if the content overflows the container
    const scrollable = el.scrollWidth > el.clientWidth;
    setIsScrollable(scrollable);

    // Update boundary flags
    setCL(el.scrollLeft > 6);
    setCR(Math.ceil(el.scrollLeft + el.clientWidth) < el.scrollWidth - 6);
  }, []);

  // Sync immediately (no flash on first paint)
  useLayoutEffect(() => { sync(); }, [sync]);

  // Re-sync on scroll + resize
  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    el.addEventListener("scroll", sync, { passive: true });
    
    // ResizeObserver watches for both container and content changes
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    
    // Also observe children to ensure dynamic load resyncs
    if (el.children) {
      Array.from(el.children).forEach(child => ro.observe(child));
    }

    return () => { 
      el.removeEventListener("scroll", sync); 
      ro.disconnect(); 
    };
  }, [sync]);

  const go = (dir) => {
    if (rowRef.current) {
      rowRef.current.scrollBy({ left: dir * scrollAmount, behavior: "smooth" });
    }
  };

  const btnBase = [
    "absolute top-1/2 -translate-y-1/2 z-30",
    "w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white",
    "border border-gray-200",
    "shadow-[0_4px_12px_rgba(0,0,0,0.15)]",
    "flex items-center justify-center",
    "transition-all duration-300",
    "focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]",
  ].join(" ");

  return (
    <div className="relative group">
      {/* ← Left arrow */}
      <button
        onClick={() => go(-1)}
        disabled={!canLeft}
        className={`
          ${btnBase} -left-3 sm:-left-4
          ${!isScrollable ? "hidden" : ""}
          ${canLeft 
            ? "opacity-100 hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:scale-110 active:scale-95 text-gray-700 hover:text-[var(--color-brand)] cursor-pointer" 
            : "opacity-0 pointer-events-none" // Gracefully fade out but keep in DOM layout flow logically
          }
        `}
        aria-label="Scroll left"
      >
        <i className="fa-solid fa-chevron-left text-xs sm:text-sm" />
      </button>

      {/* Scrollable row */}
      <div
        ref={rowRef}
        className={`flex overflow-x-auto no-scrollbar snap-x scroll-smooth ${className}`}
      >
        {children}
      </div>

      {/* → Right arrow */}
      <button
        onClick={() => go(1)}
        disabled={!canRight}
        className={`
          ${btnBase} -right-3 sm:-right-4
          ${!isScrollable ? "hidden" : ""}
          ${canRight 
            ? "opacity-100 hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:scale-110 active:scale-95 text-gray-700 hover:text-[var(--color-brand)] cursor-pointer" 
            : "opacity-0 pointer-events-none"
          }
        `}
        aria-label="Scroll right"
      >
        <i className="fa-solid fa-chevron-right text-xs sm:text-sm" />
      </button>
    </div>
  );
};

export default ScrollRow;
