import { TableRow } from "../../request";

export interface FileBody {
  kind: 'file';
  name: 'Файл';
  fileId: string;
  contentType: string,
  group: 'Other',
}

export interface FormUrlEncodedBody {
  kind: 'form-url-encoded';
  name: 'Форма закодирована в url'
  fields: TableRow[],
  group: 'Form'
}

export interface MultipartBody {
  kind: 'multipart-form';
  name: 'Составная форма'
  fields: MultipartField[],
  group: 'Form'
}

export type MultipartField =
  | {
      id: string,
      type: 'text';
      key: string;
      value: string;
      contentType: string | null,
      isActive: boolean;
    }
  | {
      id: string,
      type: 'file';
      key: string;
      file: File; 
      contentType: string | null,
      isActive: boolean;
    };

export interface NoBody {
    kind: 'none',
    name: 'Без тела',
    group: 'Other'
}

export type RawBody = JsonBody | XmlBody | TextBody;

export interface JsonBody {
  kind: 'json';
  name: 'Json'
  contentType: 'application/json',
  value: string,
  group: 'Raw'
}

export interface XmlBody {
  kind: 'xml';
  name: 'Xml'
  contentType: 'application/xml',
  value: string,
  group: 'Raw'
}

export interface TextBody {
  kind: 'text';
  name: 'Text'
  contentType: 'text/plain',
  value: string,
  group: 'Raw'
}


export function buildJsonBody(jsonValue: string) : JsonBody {
    return { kind: 'json', 'contentType': 'application/json', 'group': 'Raw', 'name': 'Json', value: jsonValue };
}