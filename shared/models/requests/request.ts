import { id } from "zod/v4/locales";
import { HttpRequestModel } from "./http/http-request-model";

export type RequestModel = HttpRequestModel;

export const RequestTypes = {
  HTTP: 'HTTP',
  GRPC: 'gRPC',
  WEBSOCKET: 'WebSocket',
} as const;

export type RequestType = typeof RequestTypes[keyof typeof RequestTypes];

export interface BaseRequestModel {
  id: string,
  name: string,
  url: string,
  type: RequestType,
  collectionId: string | null,
  fileName: string
}

export const RequestSettingsTabItems = {
  PARAMS: 'Параметры',
  BODY: 'Тело',
  HEADERS: 'Заголовки',
  AUTH: 'Аутентификация' 
} as const;

export type RequestSettingsTabItemsType = typeof RequestSettingsTabItems[keyof typeof RequestSettingsTabItems];

export interface FileInfo {
  fileValue: File | null,
  contentType: string | null
}

export interface TableRow  {
  id: string,
  isActive: boolean
  name: string,
  value: string,
  fileInfo: FileInfo | null
}

export function buildHeader(tableRow: TableRow) : TableRow {
  return {
    id: tableRow.id,
    name: tableRow.name,
    isActive: tableRow.isActive,
    value: tableRow.value,
    fileInfo: null
  }
}