import React, { lazy, Suspense } from 'react';

/**
 * Lazy import utility to improve performance by loading components only when needed
 * @param {Function} importFunc - Import function (e.g., () => import('./Component'))
 * @param {Object} options - Options for the lazy component
 * @param {React.Component} options.fallback - Component to show while loading
 * @param {string} options.exportName - Export name if not using default export
 * @returns {React.Component} Lazy loaded component
 */
export function lazyImport(importFunc, { fallback = null, exportName = null } = {}) {
  const LazyComponent = lazy(async () => {
    const module = await importFunc();
    return exportName ? { default: module[exportName] } : module;
  });

  // Return a wrapped component with suspense
  return (props) => (
    <Suspense fallback={fallback || <DefaultLoadingFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

// A simple loading component as fallback
function DefaultLoadingFallback() {
  return (
    <div 
      style={{ 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        height: '100%',
        minHeight: '100px',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        Loading...
      </div>
    </div>
  );
} 