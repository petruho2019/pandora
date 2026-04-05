import { FileBody } from './bodies/file-body';
import { FormUrlEncodedBody } from './bodies/form-url-encoded-body';
import { MultipartBody } from './bodies/multipart-body';
import { NoBody } from './bodies/no-body'
import { RawBody } from './bodies/raw-body';
import { BaseRequestModel } from '../request';
import { z } from "zod";

export interface HttpRequestModel extends BaseRequestModel{
    method: HttpMethod,
    headers: Header | null,
    body: RequestBody | null
}

export type RequestBody =
    | NoBody
    | RawBody
    | FormUrlEncodedBody
    | MultipartBody
    | FileBody;

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

export interface Header {
    key: string;
    value: string;
    enabled: boolean;
}

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