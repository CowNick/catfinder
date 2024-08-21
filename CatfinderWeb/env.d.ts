/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly APP_SHANGHAI_CENTER_POINT: string
  readonly APP_API_URL_BASE: string
  readonly APP_ARCGIS_SERVER_URL_BASE: string
  readonly APP_LAYER_POI_ID: string
  readonly APP_LAYER_POI_STREET_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}