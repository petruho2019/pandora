import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RequestModel } from '../../../../../../../../shared/models/requests/request';
import { AuthItem } from '../../../../../../../../shared/models/requests/http/http-request-model';
import { AUTH_KIND } from '../../../../../../../../shared/models/requests/http/auth';
import { BasicAuth } from "./basic-auth/basic-auth";
import { BasicAuthInfoDto } from '../../../../../../../../shared/models/requests/dto/request-dtos';
import { BearerAuth } from "./bearer-auth/bearer-auth";

@Component({
  selector: 'request-auth',
  imports: [BasicAuth, BearerAuth],
  templateUrl: './request-auth.html',
  styleUrl: './request-auth.css',
})
export class RequestAuth {

  @Input() req: RequestModel; 
  @Input() selectedAuth: AuthItem;

  @Output() basicAuthChanged = new EventEmitter<BasicAuthInfoDto>();
  @Output() bearerAuthChanged = new EventEmitter<string | null>();

  handleBasicAuthChanged(credInfo: BasicAuthInfoDto) {
    this.basicAuthChanged.emit(credInfo);
  }

  handleBearerAuthChaned(token: string | null) {
    this.bearerAuthChanged.emit(token);
  }

  isNoAuth() {
    return this.selectedAuth.kind === AUTH_KIND.NONE;
  }
  isBearer() {
    return this.selectedAuth.kind === AUTH_KIND.BEARER;
  }
  isBasic() {
    return this.selectedAuth.kind === AUTH_KIND.BASIC;
  }
  isInherit() {
    return this.selectedAuth.kind === AUTH_KIND.INHERIT;
  }
}
