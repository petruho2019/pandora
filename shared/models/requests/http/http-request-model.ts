import { BaseRequestModel, TableRow } from '../request';
import { z } from "zod";
import { FileBody, FormUrlEncodedBody, JsonBody, MultipartBody, NoBody, TextBody, XmlBody } from './body'
import { BasicAuth, BearerAuth, InheritAuth, NoAuth } from './auth'
import { AxiosResponse } from 'axios';
import { ResultT } from '../../result';

export interface HttpRequestModel extends BaseRequestModel{
    method: HttpMethod,
    headers: TableRow[],
    params: TableRow[],
    body: Record<string, BodyItem>,
    auth: Record<string, AuthItem>
}

export type BodyItem =
  | JsonBody // Здесь может храниться не корректное значение
  | XmlBody
  | TextBody
  | FileBody
  | NoBody
  | FormUrlEncodedBody
  | MultipartBody;

  
export type AuthItem =
  | BasicAuth 
  | BearerAuth
  | InheritAuth
  | NoAuth;

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
  url: z.string(),
  type: z.string(),
  collectionId: z.string(),
  method: z.string(),
  headers: z.any().nullable(),
  body: z.any().nullable(),
  fileName: z.string()
});



export function buildDefaultBody() : Record<string, BodyItem> {
  return { 
    'none': { 'kind': 'none', 'group': 'Other', 'name': 'Без тела' } 
  };
}

export function buildDefaultAuth() : Record<string, AuthItem> {
  return { 
    'none': { 'kind': 'none', 'name': 'Без аутентификации' } 
  };
}

export type TrackedRequest = {
  req: HttpRequestModel;
  controllerId: string;
  result: ResultT<string, string>;
};

export type ResponseState = {
  req: HttpRequestModel;
  responseData: string | null;
  controllerId: string | null;
  isFinished: boolean;
  isSended: boolean;
  isFailure: boolean;
  error: string | null;
};

export type HttpConfigPayload = {
  method: string,
  url: string,
  headers: Record<string, string>,
  data: any,
  controllerId: string,
  req: HttpRequestModel
}