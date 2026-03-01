export interface RawBody {
  kind: 'raw';
  contentType:
    | 'application/json'
    | 'application/sparql-query'
    | 'text/plain'
    | 'application/xml';
  value: string;
}