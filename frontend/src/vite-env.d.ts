/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL of the Chainlit chat service embedded in the drawer iframe. */
  readonly VITE_CHAT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
