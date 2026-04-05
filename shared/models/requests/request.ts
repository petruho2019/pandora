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
  collectionId: string,
  fileName: string
}
