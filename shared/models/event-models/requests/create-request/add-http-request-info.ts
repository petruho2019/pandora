import { HttpMethod } from "../../../requests/http-request-model"
import { BaseCreateRequestInfo } from "../base/base-add-request-info";

export interface CreateHttpRequestInfo extends BaseCreateRequestInfo {
  type: 'HTTP';
  method: HttpMethod;
  url: string;
}