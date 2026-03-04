import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768;

function getViewport() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < MOBILE_BREAKPOINT,
  };
}

export default function useViewport() {
  const [viewport, setViewport] = useState(getViewport);

  useEffect(() => {
    let rafId = null;
    const handleResize = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setViewport(getViewport());
      });
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return viewport;
}
