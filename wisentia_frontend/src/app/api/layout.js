export const dynamic = 'force-dynamic';

// This file configures API route behavior
export default function ApiLayout({ children }) {
  return children;
}

// Suppress errors for missing API endpoints
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// Handle errors at the route level
export function generateMetadata() {
  return {
    title: 'API Routes',
    robots: {
      index: false,
      follow: false
    }
  };
} 