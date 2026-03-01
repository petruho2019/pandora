export type MultipartField =
  | {
      type: 'text';
      key: string;
      value: string;
      enabled: boolean;
    }
  | {
      type: 'file';
      key: string;
      fileId: string; 
      enabled: boolean;
    };