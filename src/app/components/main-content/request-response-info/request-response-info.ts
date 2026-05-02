import { Component, computed, effect, inject, input, OnInit, signal } from '@angular/core';
import { RequestModel } from '../../../../../shared/models/requests/request';
import { EditorComponent } from "ngx-monaco-editor-v2";
import { ResponseService } from '../../../../../services/response-service';
import { FormsModule } from '@angular/forms';
import { AxiosResponse } from 'axios';
import { ResponseState } from '../../../../../shared/models/requests/http/http-request-model';

@Component({
  selector: 'request-response-info',
  imports: [EditorComponent, FormsModule],
  templateUrl: './request-response-info.html',
  styleUrl: './request-response-info.css',
})
export class RequestResponseInfo {

  private responseService = inject(ResponseService);

  req = input<RequestModel>();

  responseData = signal<string | null | undefined>(null);
  responseState = signal<ResponseState | null>(null);

  responseStateFilled = computed(() => {
    return this.responseState() !== null && this.responseState() !== undefined;
  })

  currentResponse = effect(() => {
    this.responseState.set(this.responseService.responses()?.[this.req()!.id]);

    this.responseData.set(this.responseState()?.responseData);

    console.log(`Вызов computed, response state: ${JSON.stringify(this.responseState(), null, 2)}`);
  });

  isOk(res: AxiosResponse) {
    if(res.status >= 200 && res.status < 300) {
      this.responseData = res.data;
    }
  }
}
