import { Component, EventEmitter, input, Input, InputSignal, Output } from '@angular/core';
import { RequestModel } from '../../../../../../../../shared/models/requests/request';
import { AuthItem } from '../../../../../../../../shared/models/requests/http/http-request-model';
import {
  AUTH_KIND,
  HttpBasicAuth,
  HttpBearerAuth,
} from '../../../../../../../../shared/models/requests/http/auth';
import { BasicAuth } from './basic-auth/basic-auth';
import { BasicAuthInfoDto } from '../../../../../../../../shared/models/requests/dto/request-dtos';
import { BearerAuth } from './bearer-auth/bearer-auth';
import { InheritAuth } from "./inherit-auth/inherit-auth";

@Component({
  selector: 'request-auth',
  imports: [BasicAuth, BearerAuth, InheritAuth],
  templateUrl: './request-auth.html',
  styleUrl: './request-auth.css',
})
export class RequestAuth {
  req = input<RequestModel>() as InputSignal<RequestModel>;
  selectedAuth = input<AuthItem>() as InputSignal<AuthItem>;
  selectedCollectionAuth = input<AuthItem>();

  @Output() basicAuthChanged = new EventEmitter<BasicAuthInfoDto>();
  @Output() bearerAuthChanged = new EventEmitter<string | null>();

  handleBasicAuthChanged(credInfo: BasicAuthInfoDto) {
    this.basicAuthChanged.emit(credInfo);
  }

  handleBearerAuthChaned(token: string | null) {
    this.bearerAuthChanged.emit(token);
  }

  isNoAuth() {
    return this.selectedAuth().kind === AUTH_KIND.NONE;
  }
  isBearer() {
    return this.selectedAuth().kind === AUTH_KIND.BEARER;
  }
  isBasic() {
    return this.selectedAuth().kind === AUTH_KIND.BASIC;
  }
  isInherit() {
    return this.selectedAuth().kind === AUTH_KIND.INHERIT;
  }

  getBearerAuth() {
    return this.req().auth[AUTH_KIND.BEARER] as HttpBearerAuth;
  }

  getBasicAuth() {
    return this.req().auth[AUTH_KIND.BASIC] as HttpBasicAuth;
  }
}
