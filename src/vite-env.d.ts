/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PRISMIC_REPO_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
