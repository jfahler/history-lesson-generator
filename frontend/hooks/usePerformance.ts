import { useEffect, useCallback } from 'react';
import { optimizeLoading, cleanupResources, measurePerformance } from '../utils/performance';

// Hook for performance optimization
export const usePerformance = () => {
  useEffect(() => {
    // Initialize performance optimizations
    optimizeLoading();
    
    // Cleanup on unmount
    return () => {
      cleanupResources();
    };
  }, []);

  const measureAsync = useCallback(async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    const start = performance.now();
    try {
      const result = await fn();
      const end = performance.now();
      console.log(`${name} took ${end - start} milliseconds`);
      return result;
    } catch (error) {
      const end = performance.now();
      console.log(`${name} failed after ${end - start} milliseconds`);
      throw error;
    }
  }, []);

  const measureSync = useCallback(<T>(name: string, fn: () => T): T => {
    const start = performance.now();
    try {
      const result = fn();
      const end = performance.now();
      console.log(`${name} took ${end - start} milliseconds`);
      return result;
    } catch (error) {
      const end = performance.now();
      console.log(`${name} failed after ${end - start} milliseconds`);
      throw error;
    }
  }, []);

  return {
    measureAsync,
    measureSync
  };
};

// Hook for lazy loading components
export const useLazyComponent = <T>(
  importFn: () => Promise<{ default: T }>,
  deps: any[] = []
) => {
  const loadComponent = useCallback(async () => {
    try {
      const module = await importFn();
      return module.default;
    } catch (error) {
      console.error('Failed to load component:', error);
      throw error;
    }
  }, deps);

  return loadComponent;
};

// Hook for monitoring component render performance
export const useRenderPerformance = (componentName: string) => {
  useEffect(() => {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      if (end - start > 16) { // More than one frame (16ms)
        console.warn(`${componentName} render took ${end - start}ms (>16ms)`);
      }
    };
  });
};
