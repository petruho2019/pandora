import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnChanges,
  OnInit,
  signal,
  SimpleChanges,
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
import { NgClass } from '@angular/common';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { AlertNotificationService } from '../../../../../services/alert-notification-service';

export const TabItem = {
  RESPONSE: 'Ответ',
  HEADERS: 'Заголовки',
} as const;

export type TabItemType = (typeof TabItem)[keyof typeof TabItem];

@Component({
  selector: 'request-response-info',
  imports: [EditorComponent, FormsModule, NgClass, ClipboardModule],
  templateUrl: './request-response-info.html',
  styleUrl: './request-response-info.css',
})
export class RequestResponseInfo implements OnChanges {
  private responseService = inject(ResponseService);
  private stopwatchService = inject(StopwatchService);
  private alertNotificationService = inject(AlertNotificationService);

  req = input<RequestModel>();

  responseModel = signal<HttpResponseModel | null>(null);
  responseState = signal<ResponseState | null>(null);

  tabItems: TabItemType[] = [TabItem.RESPONSE, TabItem.HEADERS];

  selectedTabItem = signal<Record<string, TabItemType>>({});

  responseStateFilled = computed(() => {
    return this.responseState() !== null && this.responseState() !== undefined;
  });

  readonly responseHeaders = computed(() => {
    const headers = this.responseModel()?.headers;
    if (!headers) return [];

    return Object.entries(headers)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([name, value]) => ({
        name,
        value: Array.isArray(value) ? value.join(', ') : String(value),
      }));
  });

  syncResponse = effect(() => {
    const req = this.req();
    if (!req) return;

    const state = this.responseService.responses()?.[req.id];

    // this.responseState.set({
    //   req: this.req()!,
    //   responseModel: {
    //     status: 200,
    //     statusText: 'OK',
    //     headers: {
    //       'content-length': '13',
    //       'content-type': 'text/plain; charset=utf-8',
    //       date: 'Tue, 05 May 2026 20:13:40 GMT',
    //       server: 'Kestrel',
    //     },
    //     body: `фыв
    //   фыв

    //   фыв

    //   фыв

    //   фыв

    //   фы
    //   в
    //   фы
    //   в
    //   фы
    //   в
    //   фы
    //   в
    //   ф
    //   ыв
    //   ф
    //   ыв

    //   фы
    //   в,jdf"`,
    //   },
    //   controllerId: 'asd',
    //   isFinished: true,
    //   isSended: false,
    //   isFailure: false,
    //   error: null,
    //   time: '2.9сек',
    // });
    // this.responseModel.set({
    //   status: 200,
    //   statusText: 'OK',
    //   headers: {
    //     'content-length': '13',
    //     'content-type': 'text/plain; charset=utf-8',
    //     date: 'Tue, 05 May 2026 20:13:40 GMT',
    //     server: 'Kestrel',
    //   },
    //   body: `фыв
    //   фыв

    //   фыв

    //   фыв

    //   фыв

    //   фы
    //   в
    //   фы
    //   в
    //   фы
    //   в
    //   фы
    //   в
    //   ф
    //   ыв
    //   ф
    //   ыв

    //   фы
    //   в,jdf"`,
    // });
    this.responseState.set(state);
    this.responseModel.set(state?.responseModel);
  });

  handleFinish = effect(() => {
    const req = this.req();
    if (!req) return;

    if (!this.isFinished()) return;

    const current = this.responseState();
    if (!current || current.time != null) return;

    const time = this.stopwatchService.getSpentTime(req.id);

    this.responseState.update((s) => {
      if (!s) return s;
      return { ...s, time };
    });
  });

  formattedTime = computed(() => {
    return this.stopwatchService.getFormattedTime(this.req()!.id)();
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['req']) {
      if (this.selectedTabItem()[this.req()!.id]) return;

      this.selectedTabItem.update((items) => ({
        ...items,
        [this.req()!.id]: TabItem.RESPONSE,
      }));
    }
  }

  selectTabItem(item: TabItemType) {
    this.selectedTabItem.update((items) => ({
      ...items,
      [this.req()!.id]: item,
    }));
  }

  addAlertNotificationCopiedSuccess() {
    this.alertNotificationService.addAlertNotification({
      showSuccess: true,
      message: 'Ответ скопирован в буфер обмена',
    });
  }

  copyToClipboardResponseData() {
    return this.responseModel()?.body;
  }

  isResponseSelectedTabItem() {
    return this.selectedTabItem()[this.req()!.id] === TabItem.RESPONSE;
  }

  isHeadersSelectedTabItem() {
    return this.selectedTabItem()[this.req()!.id] === TabItem.HEADERS;
  }

  isSelectedTabItem(item: TabItemType) {
    return this.selectedTabItem()[this.req()!.id] === item;
  }
  isOk() {
    if (!this.responseModel()) return false;
    return this.responseModel()!.status >= 200 && this.responseModel()!.status < 300;
  }
  isServerErr() {
    if (!this.responseModel()) return false;
    return this.responseModel()!.status >= 500 && this.responseModel()!.status < 600;
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
  isSuccess() {
    return !this.responseState()?.isFailure;
  }

  handleCancelRequest() {
    this.responseService.cancelRequest(this.req()!);
  }

  getFormattedBody() {
    return this.responseModel()
      ?.body.replace(/\\r\\n/g, '\n')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\n');
  }
}
