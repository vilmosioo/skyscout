/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LASAIR_TOKEN?: string;
  readonly VITE_LASAIR_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
