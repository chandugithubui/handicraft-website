/**
 * src/hooks/useInView.ts
 *
 * Lightweight scroll-trigger hook using the native IntersectionObserver API.
 * Zero dependencies — no Framer Motion, no GSAP, no AOS library needed.
 *
 * Usage:
 *   const [ref, inView] = useInView({ threshold: 0.15, triggerOnce: true });
 *   <section ref={ref} className={inView ? 'animate-in' : 'animate-out'}>
 *
 * Options:
 *   threshold   — 0–1, how much of the element must be visible (default 0.12)
 *   triggerOnce — fire only the first time (stays animated, default true)
 *   rootMargin  — IntersectionObserver rootMargin (default '0px 0px -60px 0px'
 *                 so elements start animating just before they fully enter the viewport)
 */

import { useEffect, useRef, useState } from 'react';

interface UseInViewOptions {
  threshold?:   number;
  triggerOnce?: boolean;
  rootMargin?:  string;
}

type UseInViewReturn = [React.RefObject<HTMLElement | null>, boolean];

const useInView = ({
  threshold   = 0.12,
  triggerOnce = true,
  rootMargin  = '0px 0px -60px 0px',
}: UseInViewOptions = {}): UseInViewReturn => {
  const ref     = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Graceful fallback: if IntersectionObserver is unavailable (very old browser)
    // just show everything immediately.
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (triggerOnce) observer.unobserve(el);
        } else if (!triggerOnce) {
          setInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, triggerOnce, rootMargin]);

  return [ref, inView];
};

export default useInView;
