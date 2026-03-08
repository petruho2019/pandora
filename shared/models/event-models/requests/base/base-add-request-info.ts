import { RequestType } from "../../../requests/request";

export interface BaseCreateRequestInfo {
  name: string;
  type: RequestType;
  collectionId: string
  collectionPath: string
}