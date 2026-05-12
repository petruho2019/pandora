import { Component, EventEmitter, input, linkedSignal, Output } from '@angular/core';
import { HttpBearerAuth } from '../../../../../../../../../shared/models/requests/http/auth';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'bearer-auth',
  imports: [FormsModule],
  templateUrl: './bearer-auth.html',
  styleUrl: './bearer-auth.css',
})
export class BearerAuth {
  bearerAuth = input.required<HttpBearerAuth>();

  editableToken = linkedSignal(() => this.bearerAuth()?.token ?? '').asReadonly();

  updateEditableToken(token: string) {
    this.authChanged.emit(token);
  }

  @Output() authChanged = new EventEmitter<string | null>();

  isPasswordShow: boolean = false;
}
