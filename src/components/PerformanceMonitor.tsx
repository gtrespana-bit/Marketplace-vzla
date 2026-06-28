'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  fcp?: number;
  lcp?: number;
  cls?: number;
  fid?: number;
  ttfb?: number;
}

export const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [navigationType, setNavigationType] = useState<string>('');

  useEffect(() => {
    // Registrar el tipo de navegación
    const perfNav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    setNavigationType(perfNav.type);

    // FCP (First Contentful Paint) - con timeout para evitar bloqueo
    setTimeout(() => {
      const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
      if (fcpEntry) {
        setMetrics(prev => ({ ...prev, fcp: Math.round(fcpEntry.startTime) }));
      }
    }, 0);

    // LCP (Largest Contentful Paint) - con timeout y límite
    setTimeout(() => {
      try {
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          if (entries.length > 0) {
            const lastEntry = entries[entries.length - 1];
            setMetrics(prev => ({ ...prev, lcp: Math.round(lastEntry.startTime) }));
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP observer failed:', e);
      }
    }, 100);

    // CLS (Cumulative Layout Shift) - con timeout y límite
    setTimeout(() => {
      try {
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry) => {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          });
          setMetrics(prev => ({ ...prev, cls: parseFloat(clsValue.toFixed(3)) }));
        }).observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('CLS observer failed:', e);
      }
    }, 100);

    // TTFB (Time to First Byte) - con timeout
    setTimeout(() => {
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navEntry) {
        setMetrics(prev => ({ 
          ...prev, 
          ttfb: Math.round(navEntry.responseStart - navEntry.requestStart) 
        }));
      }
    }, 0);
  }, []);

  // Mostrar métricas en la consola para monitoreo
  useEffect(() => {
    if (Object.keys(metrics).length > 0) {
      console.log('Performance Metrics:', {
        ...metrics,
        navigationType,
        timestamp: new Date().toISOString()
      });
    }
  }, [metrics, navigationType]);

  // Este componente no renderiza nada visible, solo monitorea
  return null;
};