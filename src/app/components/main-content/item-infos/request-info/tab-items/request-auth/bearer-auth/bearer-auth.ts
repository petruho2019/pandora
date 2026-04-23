import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { RequestModel } from '../../../../../../../../../shared/models/requests/request';
import { AUTH_KIND } from '../../../../../../../../../shared/models/requests/http/auth';
import { BearerAuth as HttpBearerAuth } from '../../../../../../../../../shared/models/requests/http/auth';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'bearer-auth',
  imports: [FormsModule],
  templateUrl: './bearer-auth.html',
  styleUrl: './bearer-auth.css',
})
export class BearerAuth {
  @Input() req: RequestModel;
  
  @Output() authChanged = new EventEmitter<string | null>();

  token: string | null;

  isPasswordShow: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['req']) {
      const auth = this.req.auth[AUTH_KIND.BEARER] as HttpBearerAuth;

      this.token = auth?.token;
    }
  }

  tokenChanged() {
    this.authChanged.emit(this.token);
  }
}
