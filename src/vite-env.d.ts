/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_IN_DOCKER?: string
  // add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
