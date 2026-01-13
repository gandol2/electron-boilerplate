/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CUSTOMER_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

import type { PreloadAPI } from '../shared/types/preload-api';

declare global {
  interface Window {
    api: PreloadAPI;
  }
}

export {};
