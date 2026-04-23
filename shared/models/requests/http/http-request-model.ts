import { BaseRequestModel, TableRow } from '../request';
import { z } from "zod";
import { FileBody, FormUrlEncodedBody, JsonBody, MultipartBody, NoBody, TextBody, XmlBody } from './body'
import { BasicAuth, BearerAuth, InheritAuth, NoAuth } from './auth'

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