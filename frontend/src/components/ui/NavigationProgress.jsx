import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import "./PageLoader.css";

/**
 * Shows a slim top progress bar on every route change.
 * For quick navigations the bar fills and fades out;
 * for lazy-loaded chunks the Suspense fallback (PageLoader) takes over.
 */
export default function NavigationProgress() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const timeoutRef = useRef(null);
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    // Skip the initial mount
    if (prevPath.current === location.pathname) return;
    prevPath.current = location.pathname;

    // Start progress bar
    setDone(false);
    setLoading(true);

    // Clear any pending timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Mark as done after a brief moment
    timeoutRef.current = setTimeout(() => {
      setDone(true);
      // Then hide completely
      timeoutRef.current = setTimeout(() => {
        setLoading(false);
        setDone(false);
      }, 300);
    }, 400);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [location.pathname]);

  if (!loading) return null;

  return (
    <div className={`page-loader-bar ${done ? "page-loader-bar--done" : ""}`}>
      <div className="page-loader-bar__track" />
    </div>
  );
}
