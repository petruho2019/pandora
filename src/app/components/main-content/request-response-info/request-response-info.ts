import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { RequestModel } from '../../../../../shared/models/requests/request';
import { EditorComponent } from 'ngx-monaco-editor-v2';
import { ResponseService } from '../../../../../services/response-service';
import { FormsModule } from '@angular/forms';
import { AxiosResponse } from 'axios';
import {
  HttpResponseModel,
  ResponseState,
} from '../../../../../shared/models/requests/http/http-request-model';
import { StopwatchService } from '../../../../../services/stopwatch-service';

@Component({
  selector: 'request-response-info',
  imports: [EditorComponent, FormsModule],
  templateUrl: './request-response-info.html',
  styleUrl: './request-response-info.css',
})
export class RequestResponseInfo {
  private responseService = inject(ResponseService);
  private stopwatchService = inject(StopwatchService);

  req = input<RequestModel>();

  // responseModel = signal<HttpResponseModel | null>({});

  responseModel = signal<HttpResponseModel | null>(null);

  responseState = signal<ResponseState | null>(null);

  @ViewChild(EditorComponent) monacoEditor?: any;

  onEditorInit(editor: any) {
    this.monacoEditor = editor;
    queueMicrotask(() => editor.layout());
  }

  responseStateFilled = computed(() => {
    return this.responseState() !== null && this.responseState() !== undefined;
  });

  syncResponse = effect(() => {
    const req = this.req();
    if (!req) return;

    const state = this.responseService.responses()?.[req.id];

    this.responseState.set({
      req: this.req()!,
      responseModel: {
        status: 200,
        statusText: 'OK',
        headers: {
          'content-length': '13',
          'content-type': 'text/plain; charset=utf-8',
          date: 'Tue, 05 May 2026 20:13:40 GMT',
          server: 'Kestrel',
        },
        body: 'slkdfnhsl,jdf',
      },
      controllerId: 'asd',
      isFinished: true,
      isSended: false,
      isFailure: false,
      error: null,
      time: '2.9сек',
    });
    this.responseModel.set({
      status: 200,
      statusText: 'OK',
      headers: {
        'content-length': '13',
        'content-type': 'text/plain; charset=utf-8',
        date: 'Tue, 05 May 2026 20:13:40 GMT',
        server: 'Kestrel',
      },
      body: 'slkdfnhsl,jdf',
    });
  });

  handleFinish = effect(() => {
    const req = this.req();
    if (!req) return;

    if (!this.isFinished()) return;

    console.log(`handleFinish`);

    const current = this.responseState();
    if (!current || current.time != null) return;

    const time = this.stopwatchService.getSpentTime(req.id);

    this.responseState.update((s) => {
      if (!s) return s;
      return { ...s, time };
    });

    console.log(`sd;lkfhj`);
  });

  formattedTime = computed(() => {
    return this.stopwatchService.getFormattedTime(this.req()!.id)();
  });

  isOk(res: AxiosResponse) {
    if (res.status >= 200 && res.status < 300) {
      this.responseModel = res.data;
    }
  }

  isSended() {
    return (
      this.responseState()?.isSended &&
      !this.responseState()?.isFinished &&
      !this.responseState()?.isFailure
    );
  }

  isFinished() {
    return !this.responseState()?.isSended && this.responseState()?.isFinished;
  }

  handleCancelRequest() {
    this.responseService.cancelRequest(this.req()!);
  }
}
