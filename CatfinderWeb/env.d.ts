/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly APP_SHANGHAI_CENTER_POINT: string
  readonly APP_API_URL_BASE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}