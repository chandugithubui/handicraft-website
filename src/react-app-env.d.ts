/// <reference types="react-scripts" />

// ── CSS / Image / SVG module declarations ─────────────────────────────────────

declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;
  const src: string;
  export default src;
}

declare module '*.png'  { const src: string; export default src; }
declare module '*.jpg'  { const src: string; export default src; }
declare module '*.jpeg' { const src: string; export default src; }
declare module '*.gif'  { const src: string; export default src; }
declare module '*.webp' { const src: string; export default src; }
declare module '*.ico'  { const src: string; export default src; }
declare module '*.bmp'  { const src: string; export default src; }
declare module '*.css'  { const styles: Record<string, string>; export default styles; }

// ── Window / Process env augmentations ────────────────────────────────────────

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly REACT_APP_API_URL?: string;
    readonly REACT_APP_GOOGLE_CLIENT_ID?: string;
    readonly REACT_APP_RAZORPAY_KEY_ID?: string;
    readonly REACT_APP_STRIPE_PUBLISHABLE_KEY?: string;
  }
}

declare module '@stripe/react-stripe-js';
declare module '@stripe/stripe-js';

interface Window {
  Razorpay?: any;
}


