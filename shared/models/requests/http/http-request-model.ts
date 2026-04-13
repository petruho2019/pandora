import { BaseRequestModel, TableRow } from '../request';
import { z } from "zod";
import { FileBody, FormUrlEncodedBody, JsonBody, MultipartBody, NoBody, TextBody, XmlBody } from '../http/bodies/body'

export interface HttpRequestModel extends BaseRequestModel{
    method: HttpMethod,
    headers: TableRow[],
    params: TableRow[],
    body: Record<string, BodyItem>
}

export type BodyItem =
  | JsonBody
  | XmlBody
  | TextBody
  | FileBody
  | NoBody
  | FormUrlEncodedBody
  | MultipartBody;

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