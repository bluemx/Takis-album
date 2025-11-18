// Types for @google/model-viewer
declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      src?: string;
      alt?: string;
      ar?: string | boolean;
      'ar-modes'?: string;
      'camera-controls'?: string | boolean;
      'environment-image'?: string;
      poster?: string;
      'shadow-intensity'?: string;
      'auto-rotate'?: string | boolean;
      loading?: 'auto' | 'lazy' | 'eager';
      reveal?: 'auto' | 'interaction' | 'manual';
    };
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}

export {};