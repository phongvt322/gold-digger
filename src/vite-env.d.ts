/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOLD_API_KEY?: string
  readonly VITE_EXCHANGE_API_KEY?: string
  readonly VITE_DOJI_API_KEY?: string
  readonly VITE_USE_MOCK_DATA?: string
  readonly VITE_ZALO_ACCESS_TOKEN?: string
  readonly VITE_ZALO_GROUP_ID?: string
  readonly VITE_ZALO_WEBHOOK_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
