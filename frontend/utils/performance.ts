// Performance utilities for optimizing the application

// Preload critical resources
export const preloadCriticalResources = () => {
  // Preload the backend client module
  const link = document.createElement('link');
  link.rel = 'modulepreload';
  link.href = '/src/~backend/client.ts';
  document.head.appendChild(link);
};

// Lazy load images with intersection observer
export const lazyLoadImages = () => {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        img.src = img.dataset.src || '';
        img.classList.remove('lazy');
        observer.unobserve(img);
      }
    });
  });

  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
};

// Debounce function for search inputs
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for scroll events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memory cleanup for components
export const cleanupResources = () => {
  // Clear any intervals or timeouts
  const highestTimeoutId = setTimeout(() => {}, 0);
  for (let i = 0; i < highestTimeoutId; i++) {
    clearTimeout(i);
  }
  
  const highestIntervalId = setInterval(() => {}, 0);
  for (let i = 0; i < highestIntervalId; i++) {
    clearInterval(i);
  }
};

// Optimize bundle loading
export const optimizeLoading = () => {
  // Preload critical resources
  preloadCriticalResources();
  
  // Setup lazy loading for images
  if ('IntersectionObserver' in window) {
    lazyLoadImages();
  }
  
  // Prefetch likely next pages
  const prefetchLinks = document.querySelectorAll('link[rel="prefetch"]');
  if (prefetchLinks.length === 0) {
    // Add prefetch for common resources
    const prefetchLink = document.createElement('link');
    prefetchLink.rel = 'prefetch';
    prefetchLink.href = '/api/lesson/generate';
    document.head.appendChild(prefetchLink);
  }
};

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
};

// Bundle size analyzer helper
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Bundle analysis available in production build');
  }
};
