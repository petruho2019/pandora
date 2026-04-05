export interface FormUrlEncodedBody {
  kind: 'form-url-encoded';
  fields: Array<{
    key: string;
    value: string;
    enabled: boolean;
  }>;
}