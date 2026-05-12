import { BaseRequestModel, TableRow } from '../request';
import { z } from 'zod';
import {
  FileBody,
  FormUrlEncodedBody,
  JsonBody,
  MultipartBody,
  NoBody,
  TextBody,
  XmlBody,
} from './body';
import { HttpBasicAuth, HttpBearerAuth, HttpInheritAuth, HttpNoAuth } from './auth';
import * as axios from 'axios';
import { ResultT } from '../../result';

export interface HttpRequestModel extends BaseRequestModel {
  method: HttpMethod;
  headers: TableRow[];
  params: TableRow[];
  body: Record<string, BodyItem>;
  auth: Record<string, AuthItem>;
}

export type BodyItem =
  | JsonBody // Здесь может храниться не корректное значение
  | XmlBody
  | TextBody
  | FileBody
  | NoBody
  | FormUrlEncodedBody
  | MultipartBody;

export type AuthItem = HttpBasicAuth | HttpBearerAuth | HttpInheritAuth | HttpNoAuth;

export type BodyGroup = {
  name: string;
  key: BodyItem['group'];
  items: BodyItem[];
};

export const HttpMethods = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS',
} as const;

export type HttpMethod = keyof typeof HttpMethods;

export const HttpRequestSchema = z.object({
  id: z.string(),
  name: z.string(),
  auth: z.any().nullable(),
  url: z.string(),
  type: z.string(),
  collectionId: z.string(),
  method: z.string(),
  headers: z.any().nullable(),
  body: z.any().nullable(),
  fileName: z.string(),
});

export function buildDefaultBody(): Record<string, BodyItem> {
  return {
    none: { kind: 'none', group: 'Other', name: 'Без тела' },
  };
}

export function buildDefaultAuth(): Record<string, AuthItem> {
  return {
    none: { kind: 'none', name: 'Без аутентификации' },
  };
}

export type TrackedRequest = {
  req: HttpRequestModel;
  controllerId: string;
  result: ResultT<string, string>;
};

export type ResponseState = {
  req: HttpRequestModel;
  responseModel: HttpResponseModel | null;
  controllerId: string | null;
  isFinished: boolean;
  isSended: boolean;
  isFailure: boolean;
  error: string | null;
  time: string | null;
};

export type HttpConfigPayload = {
  method: string;
  url: string;
  headers: Record<string, string>;
  data: any;
  controllerId: string;
  req: HttpRequestModel;
  cookiesHeader: string;
};

export type HttpResponseModelWrapper = {
  req: HttpRequestModel;
  responseResult: ResultT<HttpResponseModel, string>;
  controllerId: string;
};

export type HttpResponseModel = {
  body: any;
  status: number;
  statusText: string;
  headers:
    | Partial<
        axios.RawAxiosResponseHeaders & {
          'Content-Length': axios.AxiosHeaderValue;
          'Content-Encoding': axios.AxiosHeaderValue;
          'Content-Type': axios.AxiosHeaderValue;
          Server: axios.AxiosHeaderValue;
          'Cache-Control': axios.AxiosHeaderValue;
        } & {
          'set-cookie': string[];
        }
      >
    | axios.AxiosResponseHeaders;
  cookies: CookieModel[];
};

export interface CookieModel {
  id: string;
  name: string;
  value: string;
  path: string;
  domain: string;
  expiresAt: string | null;
  secure: boolean;
  httpOnly: boolean;
}
