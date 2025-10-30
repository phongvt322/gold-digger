/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOLD_API_KEY?: string
  readonly VITE_EXCHANGE_API_KEY?: string
  readonly VITE_DOJI_API_KEY?: string
  readonly VITE_USE_MOCK_DATA?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
