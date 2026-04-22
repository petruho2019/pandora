import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RequestModel } from '../../../../../../../../shared/models/requests/request';
import { AuthItem } from '../../../../../../../../shared/models/requests/http/http-request-model';
import { AUTH_KIND } from '../../../../../../../../shared/models/requests/http/auth';
import { BasicAuth } from "../basic-auth/basic-auth";
import { BasicAuthInfoDto } from '../../../../../../../../shared/models/requests/dto/request-dtos';

@Component({
  selector: 'request-auth',
  imports: [BasicAuth],
  templateUrl: './request-auth.html',
  styleUrl: './request-auth.css',
})
export class RequestAuth {

  @Input() req: RequestModel; 
  @Input() selectedAuth: AuthItem;

  @Output() basicAuthChanged = new EventEmitter<BasicAuthInfoDto>();
  @Output() urlEncodedChanged = new EventEmitter();

  handleBasicAuthChanged(credInfo: BasicAuthInfoDto) {
    this.basicAuthChanged.emit(credInfo);
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
