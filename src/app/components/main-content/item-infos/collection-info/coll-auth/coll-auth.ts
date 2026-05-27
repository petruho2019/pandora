import {
  Component,
  computed,
  EventEmitter,
  HostListener,
  input,
  model,
  Output,
} from '@angular/core';
import { BearerAuth } from '../../request-info/tab-items/request-auth/bearer-auth/bearer-auth';
import { BasicAuth } from '../../request-info/tab-items/request-auth/basic-auth/basic-auth';
import { Collection } from '../../../../../../../shared/models/collections/collection';
import {
  AUTH_KIND,
  HttpBasicAuth,
  HttpBearerAuth,
  HttpNoAuth,
} from '../../../../../../../shared/models/requests/http/auth';
import { BasicAuthInfoDto } from '../../../../../../../shared/models/requests/dto/request-dtos';
import { AuthItem } from '../../../../../../../shared/models/requests/http/http-request-model';
import { NgClass } from '@angular/common';

@Component({
  selector: 'coll-auth',
  imports: [BearerAuth, BasicAuth, NgClass],
  templateUrl: './coll-auth.html',
  styleUrl: './coll-auth.css',
})
export class CollAuth {
  public coll = input.required<Collection>();
  selectedAuth = input.required<AuthItem>();

  @Output() onAuthChanged = new EventEmitter<AuthItem>();
  @Output() onAuthItemChanged = new EventEmitter<AuthItem>();
  @Output() onSaveAuth = new EventEmitter<AuthItem>();

  public isShowAuthTypes = false;

  public authItems = computed(() => {
    return [
      {
        kind: 'basic',
        name: 'Базовая',
        username: (
          this.coll().collectionConfig.collectionSettings.auth[AUTH_KIND.BASIC] as HttpBasicAuth
        )?.username,
        password: (
          this.coll().collectionConfig.collectionSettings.auth[AUTH_KIND.BASIC] as HttpBasicAuth
        )?.password,
      } as HttpBasicAuth,
      {
        kind: 'bearer',
        name: 'Bearer токен',
        token: (
          this.coll().collectionConfig.collectionSettings.auth[AUTH_KIND.BEARER] as HttpBearerAuth
        )?.token,
      } as HttpBearerAuth,
      {
        kind: 'none',
        name: 'Без аутентификации',
      } as HttpNoAuth,
    ];
  });

  saveAuth() {
    this.onSaveAuth.emit(this.selectedAuth()!);
  }

  handleAuthChanged(authItem: AuthItem) {
    this.onAuthChanged.emit(authItem);
  }

  selectAuthType(auth: AuthItem) {
    this.onAuthItemChanged.emit(auth);
    this.isShowAuthTypes = false;
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

  getBearerAuth() {
    return this.coll().collectionConfig.collectionSettings.auth[AUTH_KIND.BEARER] as HttpBearerAuth;
  }

  getBasicAuth() {
    return this.coll().collectionConfig.collectionSettings.auth[AUTH_KIND.BASIC] as HttpBasicAuth;
  }

  showAuthTypes() {
    this.isShowAuthTypes = !this.isShowAuthTypes;
  }

  @HostListener('document:click')
  public closeAuthTypes() {
    this.isShowAuthTypes = false;
  }
}
