import { Component, input } from '@angular/core';
import { AuthItem } from '../../../../../../../../../shared/models/requests/http/http-request-model';

@Component({
  selector: 'inherit-auth',
  imports: [],
  templateUrl: './inherit-auth.html',
  styleUrl: './inherit-auth.css',
})
export class InheritAuth {
  selectedCollectionAuth = input<AuthItem>();
}
