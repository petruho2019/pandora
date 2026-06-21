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

export const statusTexts: Record<number, string> = {
  100: 'Continue',
  101: 'Switching Protocols',
  102: 'Processing',
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  203: 'Non-Authoritative Information',
  204: 'No Content',
  205: 'Reset Content',
  206: 'Partial Content',
  207: 'Multi-Status',
  208: 'Already Reported',
  226: 'IM Used',
  300: 'Multiple Choices',
  301: 'Moved Permanently',
  302: 'Found',
  303: 'See Other',
  304: 'Not Modified',
  305: 'Use Proxy',
  307: 'Temporary Redirect',
  308: 'Permanent Redirect',
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Payload Too Large',
  414: 'URI Too Long',
  415: 'Unsupported Media Type',
  416: 'Range Not Satisfiable',
  417: 'Expectation Failed',
  418: "I'm a Teapot",
  421: 'Misdirected Request',
  422: 'Unprocessable Entity',
  423: 'Locked',
  424: 'Failed Dependency',
  425: 'Too Early',
  426: 'Upgrade Required',
  428: 'Precondition Required',
  429: 'Too Many Requests',
  431: 'Request Header Fields Too Large',
  451: 'Unavailable For Legal Reasons',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
  506: 'Variant Also Negotiates',
  507: 'Insufficient Storage',
  508: 'Loop Detected',
  510: 'Not Extended',
  511: 'Network Authentication Required',
};

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
