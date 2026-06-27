'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetricsProps {
  children: React.ReactNode;
}

export const PerformanceMetrics = ({ children }: PerformanceMetricsProps) => {
  const [metrics, setMetrics] = useState<{
    fcp?: number;
    lcp?: number;
    cls?: number;
    fid?: number;
  }>({});

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Function to report metrics
    const reportMetrics = () => {
      // Get FCP (First Contentful Paint)
      const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
      if (fcpEntry) {
        setMetrics(prev => ({ ...prev, fcp: fcpEntry.startTime }));
      }

      // Get LCP (Largest Contentful Paint)
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Get CLS (Cumulative Layout Shift)
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const clsValue = entries.reduce((total, entry) => {
          if ((entry as any).hadRecentInput) return total;
          return total + (entry as any).value;
        }, 0);
        setMetrics(prev => ({ ...prev, cls: clsValue }));
      }).observe({ entryTypes: ['layout-shift'] });

      // Get FID (First Input Delay)
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const fidEntry = entries[0];
        if (fidEntry) {
          setMetrics(prev => ({ ...prev, fid: (fidEntry as any).processingStart - (fidEntry as any).startTime }));
        }
      }).observe({ entryTypes: ['first-input'] });
    };

    // Report metrics after a short delay to ensure all entries are available
    const timer = setTimeout(reportMetrics, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Don't render anything visible, just collect metrics
  return <>{children}</>;
};