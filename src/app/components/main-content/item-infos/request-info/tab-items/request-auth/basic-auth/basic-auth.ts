import { Component, EventEmitter, input, linkedSignal, Output } from '@angular/core';
import { AUTH_KIND } from '../../../../../../../../../shared/models/requests/http/auth';
import { HttpBasicAuth as HttpBasicAuth } from '../../../../../../../../../shared/models/requests/http/auth';
import { BasicAuthInfoDto } from '../../../../../../../../../shared/models/requests/dto/request-dtos';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'basic-auth',
  imports: [FormsModule],
  templateUrl: './basic-auth.html',
  styleUrl: './basic-auth.css',
})
export class BasicAuth {
  basicAuth = input.required<HttpBasicAuth>();

  @Output() authChanged = new EventEmitter<BasicAuthInfoDto>();

  isPasswordShow: boolean = false;

  editableCredentials = linkedSignal(() => this.basicAuth() ?? { username: '', password: '' });

  credentialsChanged(v: Partial<HttpBasicAuth>) {
    this.editableCredentials.update((state) => ({ ...state, ...v }));

    this.authChanged.emit(this.editableCredentials());
  }

  setPasswordShow() {
    this.isPasswordShow = !this.isPasswordShow;
  }
}
