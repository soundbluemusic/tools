/// <reference types="vite/client" />

/**
 * Extended Environment Variables Type Definitions
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ImportMetaEnv {
  /** Application mode */
  readonly MODE: 'development' | 'production' | 'test';
  /** Base URL */
  readonly BASE_URL: string;
  /** Development mode flag */
  readonly DEV: boolean;
  /** Production mode flag */
  readonly PROD: boolean;
  /** Server-side rendering flag */
  readonly SSR: boolean;

  // Custom environment variables
  /** Application name */
  readonly VITE_APP_NAME?: string;
  /** Application version */
  readonly VITE_APP_VERSION?: string;
  /** API base URL */
  readonly VITE_API_URL?: string;
  /** Enable analytics */
  readonly VITE_ENABLE_ANALYTICS?: string;
}

/**
 * Window augmentation for global types
 */
declare global {
  interface Window {
    /** Debug utilities (development only) */
    __DEBUG__?: {
      version: string;
      env: string;
    };
  }
}

export {};
