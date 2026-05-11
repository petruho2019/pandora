import {
  RequestModel,
  RequestSettingsTabItems,
  RequestSettingsTabItemsType,
  TableRow,
} from './../../../../../../shared/models/requests/request';
import {
  Component,
  computed,
  EventEmitter,
  HostListener,
  inject,
  input,
  model,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { RequestUrl } from './request-url/request-url';
import { NgClass } from '@angular/common';
import { RequestParams } from './tab-items/request-params/request-params';
import { RequestHeaders } from './tab-items/request-headers/request-headers';
import {
  AuthItem,
  BodyGroup,
  BodyItem,
  CookieModel,
  HttpMethod,
} from '../../../../../../shared/models/requests/http/http-request-model';
import { RequestBody as RequestBodyComponent } from './tab-items/request-body/request-body';
import { isEqual } from 'lodash';
import {
  buildJsonBody,
  buildTextBody,
  buildXmlBody,
  FormUrlEncodedBody,
  FileBody,
  MultipartBody,
  MultipartField,
} from '../../../../../../shared/models/requests/http/body';
import { TabItemService } from '../../../../../../services/tab-item-service';
import {
  BODY_KIND,
  GENERAL_INFORMATION_WORKSPACE_ID,
} from '../../../../../../shared/models/constants';
import { SendRequestService } from '../../../../../../services/electron/send-request-service';
import { RequestStateService } from '../../../../../../services/request-state-service';
import { RequestAuth } from './tab-items/request-auth/request-auth';
import { BasicAuthInfoDto } from '../../../../../../shared/models/requests/dto/request-dtos';
import {
  AUTH_KIND,
  BasicAuth,
  BearerAuth,
} from '../../../../../../shared/models/requests/http/auth';
import { ResponseService } from '../../../../../../services/response-service';
import { Store } from '@ngrx/store';
import {
  addCookieModal,
  deleteCookieModal,
  deleteDomainModal,
  modifyCookieModal,
} from '../../../../store/actions/modal-actions/cookie-modal.actions';
import { OverlayRef } from '@angular/cdk/overlay';
import {
  DeleteCookieActionDto,
  DeleteDomainActionDto,
} from './request-url/cookies-info/cookies-info';
import { selectAll } from '../../../../store/selectors/cookies.selectors';
import { loadCookies } from '../../../../store/actions/cookies.actions';
import { take } from 'rxjs';

@Component({
  selector: 'request-info',
  imports: [RequestUrl, NgClass, RequestParams, RequestHeaders, RequestBodyComponent, RequestAuth],
  templateUrl: './request-info.html',
  styleUrl: './request-info.css',
})
export class RequestInfo implements OnInit, OnChanges {
  private tabItemService = inject(TabItemService);
  private sendRequestService = inject(SendRequestService);
  private requestStateService = inject(RequestStateService);
  private responseService = inject(ResponseService);
  private store = inject(Store);

  initialRequests = input<Record<string, RequestModel>>();

  req = input<RequestModel>();

  selectedTabItem = model<Record<string, RequestSettingsTabItemsType>>();
  selectedBody = model<Record<string, BodyItem>>();
  selectedAuthType = model<Record<string, AuthItem>>();

  @Output() onSelectedRequestSettingTabItemChanged = new EventEmitter<{
    tabType: RequestSettingsTabItemsType;
    reqId: string;
  }>();

  @Output() onSelectedBodyItemChanged = new EventEmitter<{ bodyItem: BodyItem; reqId: string }>();
  @Output() onSelectedAuthItemChanged = new EventEmitter<{ authItem: AuthItem; reqId: string }>();
  @Output() onSaveReq = new EventEmitter<RequestModel>();
  @Output() onCreateRequestTabItem = new EventEmitter();

  public isShowBodyTypes: boolean = false;
  public isShowAuthTypes: boolean = false;

  public requestChanged = computed(() => {
    return this.requestStateService._requestChanged()[this.req()!.id].isChanged;
  });

  isReqSended = computed(() => {
    return this.responseService.isReqSended(this.req()!.id);
  });

  public tabItems = Object.values(RequestSettingsTabItems);
  public requestSettingsTabItems = RequestSettingsTabItems;

  ngOnInit(): void {
    this.selectedBody()![this.req()!.id] = this.req()!.body[BODY_KIND.NONE];
    this.store.dispatch(loadCookies());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['req']) {
      this.checkIsReqChanged();
    }
  }

  public bodyGroups: BodyGroup[] = [
    {
      name: 'Форма',
      key: 'Form',
      items: [
        {
          kind: 'multipart-form',
          name: 'Составная форма',
          fields: [],
          group: 'Form',
        },
        {
          kind: 'form-url-encoded',
          name: 'Форма закодирована в url',
          fields: [],
          group: 'Form',
        },
      ],
    },
    {
      name: 'Сырой текст',
      key: 'Raw',
      items: [
        {
          kind: 'json',
          name: 'Json',
          contentType: 'application/json',
          value: '',
          group: 'Raw',
        },
        {
          kind: 'text',
          name: 'Text',
          contentType: 'text/plain',
          value: '',
          group: 'Raw',
        },
        {
          kind: 'xml',
          name: 'Xml',
          contentType: 'application/xml',
          value: '',
          group: 'Raw',
        },
      ],
    },
    {
      name: 'Другое',
      key: 'Other',
      items: [
        {
          kind: 'file',
          name: 'Файл',
          files: [],
          group: 'Other',
        },
        {
          kind: 'none',
          name: 'Без тела',
          group: 'Other',
        },
      ],
    },
  ];

  public authItems: AuthItem[] = [
    {
      name: 'Базовая',
      kind: 'basic',
      username: null,
      password: null,
    },
    {
      name: 'Bearer токен',
      kind: 'bearer',
      token: null,
    },
    {
      name: 'Наследовать из коллекции',
      kind: 'inherit',
      authTypeFromColl: 'none',
    },
    {
      name: 'Без аутентификации',
      kind: 'none',
    },
  ];

  showBodyTypes() {
    this.isShowBodyTypes = !this.isShowBodyTypes;
  }
  showAuthTypes() {
    this.isShowAuthTypes = !this.isShowAuthTypes;
  }

  selectTabItem(tabItem: RequestSettingsTabItemsType) {
    this.selectedTabItem.update((items) => ({
      ...items,
      [this.req()!.id]: tabItem,
    }));

    this.onSelectedRequestSettingTabItemChanged.emit({
      tabType: tabItem,
      reqId: this.req()!.id,
    });
  }

  selectBodyType(body: BodyItem) {
    const newBody = structuredClone(body);

    this.selectedBody.update((bis) => ({
      ...bis,
      [this.req()!.id]: newBody,
    }));

    this.isShowBodyTypes = false;

    this.onSelectedBodyItemChanged.emit({ bodyItem: newBody, reqId: this.req()!.id });

    this.checkIsReqChanged();
  }
  selectAuthType(auth: AuthItem) {
    const newAuth = structuredClone(auth);

    this.selectedAuthType.update((ais) => ({
      ...ais,
      [this.req()!.id]: newAuth,
    }));

    this.isShowAuthTypes = false;

    this.onSelectedAuthItemChanged.emit({ authItem: newAuth, reqId: this.req()!.id });

    this.checkIsReqChanged();
  }

  isParamsTabItem() {
    return this.selectedTabItem()![this.req()!.id] === RequestSettingsTabItems.PARAMS;
  }
  isBodyTabItem() {
    let a = this.selectedTabItem();
    return this.selectedTabItem()![this.req()!.id] === RequestSettingsTabItems.BODY;
  }
  isJsonBodyItem() {
    return this.isBodyTabItem()
      ? this.selectedBody()![this.req()!.id].kind === BODY_KIND.JSON
      : false;
  }
  isTextBodyItem() {
    return this.isBodyTabItem()
      ? this.selectedBody()![this.req()!.id].kind === BODY_KIND.TEXT
      : false;
  }
  isXmlBodyItem() {
    return this.isBodyTabItem()
      ? this.selectedBody()![this.req()!.id].kind === BODY_KIND.XML
      : false;
  }
  isHeadersTabItem() {
    return this.selectedTabItem()![this.req()!.id] === RequestSettingsTabItems.HEADERS;
  }
  isAuthTabItem() {
    return this.selectedTabItem()![this.req()!.id] === RequestSettingsTabItems.AUTH;
  }

  handleSaveRequest() {
    this.onSaveReq.emit(this.req()!);
  }

  handleMethodChanged(newHttpMethod: HttpMethod) {
    this.req()!.method = newHttpMethod;

    this.tabItemService.updateRequest(this.req()!.id, { method: newHttpMethod });
  }
  handleUrlChanged(newUrl: string) {
    const [_, query = ''] = newUrl.split('?');
    const urlParams = query ? query.split('&').filter(Boolean) : [];
    const sourceParams = this.req()!.params;

    const newParams: TableRow[] = [];
    let urlIndex = 0;

    if (sourceParams) {
      for (const sourceParam of sourceParams) {
        if (!sourceParam.isActive) {
          newParams.push(sourceParam);
          continue;
        }

        const currentParam = urlParams[urlIndex];

        if (!currentParam) {
          continue;
        }

        const [name = '', value = ''] = currentParam.split('=', 2);

        if (name === sourceParam.name && value === sourceParam.value) {
          newParams.push(sourceParam);
        } else {
          newParams.push({
            ...sourceParam,
            name,
            value,
          });
        }

        urlIndex++;
      }
    }

    for (; urlIndex < urlParams.length; urlIndex++) {
      const [name = '', value = ''] = urlParams[urlIndex].split('=', 2);

      newParams.push({
        ...sourceParams?.[0],
        name,
        value,
        isActive: true,
      });
    }

    this.req()!.url = newUrl;
    this.req()!.params = [...newParams];

    this.tabItemService.updateRequest(this.req()!.id, { url: newUrl });
    this.tabItemService.updateRequest(this.req()!.id, { params: newParams });
  }

  handleUrlEndodedBodyChanged(body: TableRow[]) {
    const urlEncodedBody = {
      kind: BODY_KIND.FORM_URL_ENCODED,
      name: 'Форма закодирована в url',
      fields: [],
      group: 'Form',
    } as FormUrlEncodedBody;

    for (let index = 0; index < body.length; index++) {
      const tabItem = body[index];
      if (!tabItem.isActive) continue;
      if (this.isEmptyRow(tabItem)) continue;

      urlEncodedBody.fields.push(tabItem);
    }

    this.req()!.body[BODY_KIND.FORM_URL_ENCODED] = urlEncodedBody;

    this.tabItemService.updateRequest(this.req()!.id, {
      body: {
        ...this.req()!.body,
        [BODY_KIND.FORM_URL_ENCODED]: urlEncodedBody,
      },
    });
    //axios.post('http://localhost:5250/test-url-encoded', params);
  }

  handleMultipartBodyChanged(body: TableRow[]) {
    const newBody: MultipartBody = {
      kind: BODY_KIND.MULTIPART_FORM,
      name: 'Составная форма',
      fields: this.buildMultipartBody(body),
      group: 'Form',
    };

    this.req()!.body[BODY_KIND.MULTIPART_FORM] = newBody;

    this.tabItemService.updateRequest(this.req()!.id, {
      body: {
        ...this.req()!.body,
        [BODY_KIND.MULTIPART_FORM]: newBody,
      },
    });

    console.log(
      `Обновили боди handleMultipartBodyChanged, вот полученный запрос: ${JSON.stringify(this.req(), null, 2)}`,
    );

    this.selectedBody.update((bis) => ({
      ...bis,
      [this.req()!.id]: newBody,
    }));
  }

  handleTextBodyChanged(value: string) {
    console.log(`Обрабатываем text body value changed`);
    const body = buildTextBody(value);
    this.req()!.body[BODY_KIND.TEXT] = body;
    this.tabItemService.updateRequest(this.req()!.id, {
      body: {
        ...this.req()!.body,
        [BODY_KIND.TEXT]: body,
      },
    });
  }

  handleJsonBodyChanged(value: string) {
    const body = buildJsonBody(value);
    this.req()!.body[BODY_KIND.JSON] = body;
    this.tabItemService.updateRequest(this.req()!.id, {
      // todo зарефакторить, здесь можно просто передать kind и по нему менять
      body: {
        ...this.req()!.body,
        [BODY_KIND.JSON]: body,
      },
    });
  }

  handleXmlBodyChanged(value: string) {
    const body = buildXmlBody(value);
    this.req()!.body[BODY_KIND.XML] = body;
    this.tabItemService.updateRequest(this.req()!.id, {
      body: {
        ...this.req()!.body,
        [BODY_KIND.XML]: body,
      },
    });
  }

  handleFileBodyChanged(files: TableRow[]) {
    const body: FileBody = {
      kind: BODY_KIND.FILE,
      name: 'Файл',
      files: files,
      group: 'Other',
    };

    this.req()!.body[BODY_KIND.FILE] = body;
    this.tabItemService.updateRequest(this.req()!.id, {
      body: {
        ...this.req()!.body,
        [BODY_KIND.FILE]: body,
      },
    });
  }

  handleUrlParamsChanged(urlParams: string) {
    const startRequestParamsIndex = this.req()!.url.lastIndexOf('?');

    if (urlParams === '?') {
      if (startRequestParamsIndex === -1) {
        this.req()!.url = this.req()!.url;
        this.tabItemService.updateRequest(this.req()!.id, { url: this.req()!.url });
        return;
      }

      const newUrl = this.req()!.url.slice(0, startRequestParamsIndex + 1);
      this.req()!.url = newUrl;
      this.tabItemService.updateRequest(this.req()!.id, { url: newUrl });
      return;
    }

    const newUrlWithParameters = this.req()!.url.slice(0, startRequestParamsIndex) + urlParams;

    this.req()!.url = newUrlWithParameters;
    this.tabItemService.updateRequest(this.req()!.id, { url: newUrlWithParameters });
  }

  handleHeadersChanged(headers: TableRow[]) {
    this.req()!.headers = headers;
    this.tabItemService.updateRequest(this.req()!.id, { headers: headers });
  }

  handleAddCookie(cookie: CookieModel, overlayRef: OverlayRef) {
    this.store.dispatch(
      addCookieModal({ actionData: { body: { cookie: cookie }, modalOverlayRefs: [overlayRef] } }),
    );
  }

  handleModifyCookie(cookie: CookieModel, overlayRef: OverlayRef) {
    this.store.dispatch(
      modifyCookieModal({ actionData: { body: cookie, modalOverlayRefs: [overlayRef] } }),
    );
  }

  handleDeleteCookie(cookieInfo: DeleteCookieActionDto) {
    this.store.dispatch(
      deleteCookieModal({
        actionData: { body: cookieInfo, modalOverlayRefs: [cookieInfo.overlayRef] },
      }),
    );
  }
  handleDeleteDomain(domainInfo: DeleteDomainActionDto) {
    this.store.dispatch(
      deleteDomainModal({
        actionData: { body: domainInfo, modalOverlayRefs: [domainInfo.overlayRef] },
      }),
    );
  }

  async handleSendRequest() {
    this.store
      .select(selectAll)
      .pipe(take(1))
      .subscribe(
        async (cookies) =>
          await this.sendRequestService.sendRequest(
            this.req()!,
            this.selectedBody()![this.req()!.id],
            this.selectedAuthType()![this.req()!.id],
            cookies,
          ),
      );
  }

  async handleCancelRequest() {
    this.responseService.cancelRequest(this.req()!);
  }

  handleBasicAuthChanged(credInfo: BasicAuthInfoDto) {
    const auth: BasicAuth = {
      kind: 'basic',
      name: 'Базовая',
      username: credInfo.username,
      password: credInfo.password,
    };

    this.req()!.auth[AUTH_KIND.BASIC] = auth;

    this.tabItemService.updateRequest(this.req()!.id, {
      auth: {
        ...this.req()!.auth,
        [AUTH_KIND.BASIC]: auth,
      },
    });
  }

  handleBearerAuthChaned(token: string | null) {
    const auth: BearerAuth = {
      kind: 'bearer',
      name: 'Bearer токен',
      token: token,
    };

    this.req()!.auth[AUTH_KIND.BEARER] = auth;

    this.tabItemService.updateRequest(this.req()!.id, {
      auth: {
        ...this.req()!.auth,
        [AUTH_KIND.BEARER]: auth,
      },
    });
  }

  handleCreateRequestTabItem() {
    this.onCreateRequestTabItem.emit();
  }

  isEmptyRow(row: TableRow) {
    return row.name === '' && row.value === '';
  }

  buildMultipartBody(body: TableRow[]): MultipartField[] {
    const fields: MultipartField[] = [];

    for (let index = 0; index < body.length; index++) {
      const tabItem = body[index];

      if (tabItem.fileInfo?.path !== null && tabItem.fileInfo?.path !== undefined) {
        if (tabItem.fileInfo?.contentType) {
          fields.push({
            id: tabItem.id,
            type: 'file',
            key: tabItem.name,
            path: tabItem.fileInfo.path,
            contentType: tabItem.fileInfo.contentType,
            isActive: tabItem.isActive,
          });
        } else {
          fields.push({
            id: tabItem.id,
            type: 'file',
            key: tabItem.name,
            path: tabItem.fileInfo.path,
            isActive: tabItem.isActive,
            contentType: null,
          });
        }
      } else {
        // if (tabItem.multipartInfo?.contentType){
        //   formData.append(tabItem.name, new Blob([tabItem.value], { type: tabItem.multipartInfo.contentType }));
        // }
        // else {
        fields.push({
          id: tabItem.id,
          type: 'text',
          key: tabItem.name,
          value: tabItem.value,
          isActive: tabItem.isActive,
          contentType: null,
        });
        // } Посмотрел в bruno, ему на кастоный контент тайп именно у НЕ файла все ровно, так что отправляем без него
      }
    }

    return fields;
  }

  checkIsReqChanged() {
    const req = this.req()!;

    if (!req) {
      this.requestStateService.setRequestNotChanged(req);
      return;
    }

    const initial = this.initialRequests()![req.id];

    if (!initial) {
      this.requestStateService.setRequestNotChanged(req);
      return;
    }

    const changed = !isEqual(initial, req);
    this.requestStateService.setRequestChanged(req, changed);
  }

  @HostListener('document:click')
  public closeBodyTypes() {
    this.isShowBodyTypes = false;
    this.isShowAuthTypes = false;
  }

  @HostListener('window:keydown', ['$event'])
  handleRequestKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'Enter') {
      console.log(`Обрабатываем ctrl + Enter`);
      event.preventDefault();
      this.handleSendRequest();
    }

    if (event.ctrlKey && event.key === 'r') {
      console.log(`Обрабатываем ctrl + R`);
      event.preventDefault();
      this.handleCreateRequestTabItem();
    }
  }
}
