import { AuthItem, BodyItem, HttpMethod } from "../../../requests/http/http-request-model"
import { BaseCreateRequestInfo } from "../base/base-add-request-info";

export interface CreateHttpRequestInfo extends BaseCreateRequestInfo {
  type: 'HTTP';
  method: HttpMethod;
  url: string;
  body: Record<string, BodyItem>,
  auth: Record<string, AuthItem>
}