import { MultipartField } from "./multipart-field-body";

export interface MultipartBody {
  kind: 'multipart';
  fields: Array<MultipartField>;
}
