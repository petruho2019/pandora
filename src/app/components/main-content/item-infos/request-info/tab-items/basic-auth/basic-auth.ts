import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild, viewChild } from '@angular/core';
import { RequestModel } from '../../../../../../../../shared/models/requests/request';
import { AUTH_KIND } from '../../../../../../../../shared/models/requests/http/auth';
import { BasicAuth as HttpBasicAuth } from '../../../../../../../../shared/models/requests/http/auth';
import { BasicAuthInfoDto } from '../../../../../../../../shared/models/requests/dto/request-dtos';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'basic-auth',
  imports: [FormsModule],
  templateUrl: './basic-auth.html',
  styleUrl: './basic-auth.css',
})
export class BasicAuth implements OnChanges {

  @Input() req: RequestModel;
  
  @Output() authChanged = new EventEmitter<BasicAuthInfoDto>();

  username: string;
  password: string;

  isPasswordShow: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['req']) {
      const auth = this.req.auth[AUTH_KIND.BASIC] as HttpBasicAuth;

      this.username = auth.username!;
      this.password = auth.password!;
    }
  }

  credentialChanged() {
    this.authChanged.emit(this.buildDto());
  }

  buildDto() : BasicAuthInfoDto {
    return {
      username: this.username,
      password: this.password
    }
  }

  setPasswordShow() {
    this.isPasswordShow = !this.isPasswordShow;
  }

}
