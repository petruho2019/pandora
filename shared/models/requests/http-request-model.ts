import { FileBody } from './bodies/file-body';
import { FormUrlEncodedBody } from './bodies/form-url-encoded-body';
import { MultipartBody } from './bodies/multipart-body';
import { NoBody } from './bodies/no-body'
import { RawBody } from './bodies/raw-body';
import { BaseRequestModel } from './request';

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

export const HttpMethods = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
] as const;

export type HttpMethod = typeof HttpMethods[number];
export interface Header {
    key: string;
    value: string;
    enabled: boolean;
}