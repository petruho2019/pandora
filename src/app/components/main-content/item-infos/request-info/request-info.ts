import { RequestModel, RequestSettingsTabItems, RequestSettingsTabItemsType, TableRow } from './../../../../../../shared/models/requests/request';
import { ChangeDetectorRef, Component, computed, EventEmitter, HostListener, inject, input, Input, model, OnInit, Output, signal } from '@angular/core';
import { RequestUrl } from "./request-url/request-url";
import { NgClass } from '@angular/common';
import { RequestParams } from './tab-items/request-params/request-params';
import { RequestHeaders } from "./tab-items/request-headers/request-headers";
import { BodyGroup, BodyItem, HttpMethod } from '../../../../../../shared/models/requests/http/http-request-model';
import { RequestBody as  RequestBodyComponent} from "./tab-items/request-body/request-body";
import axios from 'axios';
import  { isEqual }  from 'lodash'
import { buildJsonBody, FormUrlEncodedBody, JsonBody, MultipartBody, MultipartField } from '../../../../../../shared/models/requests/http/bodies/body';
import { TabItemService } from '../../../../../../services/tab-item-service';
import { BODY_KIND } from '../../../../../../shared/models/constants';

@Component({
  selector: 'request-info',
  imports: [RequestUrl, NgClass, RequestParams, RequestHeaders, RequestBodyComponent],
  templateUrl: './request-info.html',
  styleUrl: './request-info.css',
})
export class RequestInfo implements OnInit {
  private tabItemService = inject(TabItemService);

  initialRequests = input<Record<string, RequestModel>>();
  @Input() req: RequestModel;
  selectedTabItem = model<Record<string, RequestSettingsTabItemsType>>();
  selectedBody = model<Record<string, BodyItem>>();

  @Output() selectedRequestSettingTabItemChanged = new EventEmitter<{ tabType: RequestSettingsTabItemsType , reqId: string }>();

  requestChanged = computed(() => {
    console.log(`Computed на то изменен ли запрос`);

    const req = this.req;

    if(!req) return false;

    const initial = this.initialRequests()![req!.id];

    if (!initial) return false;

    return !isEqual(initial, req);
  });

  public tabItems = Object.values(RequestSettingsTabItems);
  public requestSettingsTabItems = RequestSettingsTabItems;


  ngOnInit(): void {
    console.log(`OnInit requestInfo`);
    this.selectedBody()![this.req.id] = this.req.body[BODY_KIND.NONE];
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
        fileId: '',
        contentType: '',
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

  public isShowBodyTypes: boolean = false;

  showBodyTypes() {
    this.isShowBodyTypes = !this.isShowBodyTypes;
  }

  selectTabItem(tabItem: RequestSettingsTabItemsType){
    this.selectedTabItem.update(items => ({
      ...items,
      [this.req.id]: tabItem
    }));

    this.selectedRequestSettingTabItemChanged.emit({ tabType: tabItem, reqId: this.req.id });
  }

  setBodyType(body: BodyItem) {
    const newBody = structuredClone(body);

    console.log(`Устанавливаем новый боди у запроса`);

    this.selectedBody.update(bis => ({
      ...bis,
      [this.req.id]: newBody
    }));

    this.isShowBodyTypes = false;
  }

  isParamsTabItem(){
    return this.selectedTabItem()![this.req.id] === RequestSettingsTabItems.PARAMS;
  }
  isBodyTabItem(){
    let a = this.selectedTabItem();
    return this.selectedTabItem()![this.req.id] === RequestSettingsTabItems.BODY;
  }
  isHeadersTabItem(){
    return this.selectedTabItem()![this.req.id] === RequestSettingsTabItems.HEADERS;
  }
  isAuthTabItem(){
    return this.selectedTabItem()![this.req.id] === RequestSettingsTabItems.AUTH;
  }


  handleMethodChanged(newHttpMethod: HttpMethod){
    this.req.method = newHttpMethod;

    this.tabItemService.updateRequest(this.req.id, { method: newHttpMethod });
  }

  handleUrlChanged(newUrl: string) {
    console.log(`Устанавливаем новый url: ${newUrl}`);
    this.req.url = newUrl;

    this.tabItemService.updateRequest(this.req.id, { url: newUrl });
  }

  handleUrlEndodedBodyChanged(body: TableRow[]) {
    const urlEncodedBody = { kind: BODY_KIND.FORM_URL_ENCODED, name: 'Форма закодирована в url', fields: [], group: 'Form' } as FormUrlEncodedBody;

    for (let index = 0; index < body.length; index++) {
      const tabItem = body[index];
      if (!tabItem.isActive) continue;
      if(this.isEmptyRow(tabItem)) continue;

      urlEncodedBody.fields.push(tabItem);
    };

    this.req.body[BODY_KIND.FORM_URL_ENCODED] = urlEncodedBody

    this.tabItemService.updateRequest(this.req.id, {
      body: {
        ...this.req.body,
        [BODY_KIND.FORM_URL_ENCODED]: urlEncodedBody,
      },
    });
    //axios.post('http://localhost:5250/test-url-encoded', params);
  }

  handleMultipartBodyChanged(body: TableRow[]) {

    const newBody : MultipartBody = {
      kind: BODY_KIND.MULTIPART_FORM,
      name: 'Составная форма',
      fields: this.buildMultipartBody(body),
      group: 'Form'
    }

    this.req.body[BODY_KIND.MULTIPART_FORM] = newBody

    this.tabItemService.updateRequest(this.req.id, {
      body: {
        ...this.req.body,
        [BODY_KIND.MULTIPART_FORM]: newBody,
      },
    });

    this.selectedBody.update(bis => ({
      ...bis,
      [this.req.id]: newBody
    }));
  }
  handleJsonBodyChanged(newJsonValue: string) {
    const jsonBody = buildJsonBody(newJsonValue);
    this.req.body[BODY_KIND.JSON] = jsonBody;
    this.tabItemService.updateRequest(this.req.id, {
      body: {
        ...this.req.body,
        [BODY_KIND.JSON]: jsonBody,
      },
    });

  }

  handleUrlParamsChanged(urlParams: string) {
    const startRequestParamsIndex = this.req.url.lastIndexOf('?');

    if(urlParams === '?') {
      const newUrl = this.req.url.slice(0, startRequestParamsIndex);
      this.req.url = newUrl;
      this.tabItemService.updateRequest(this.req.id, { url: newUrl });
      return;
    }

    const newUrlWithParameters = this.req.url.slice(0, startRequestParamsIndex) + urlParams;
    
    this.req.url = newUrlWithParameters;
    this.tabItemService.updateRequest(this.req.id, { url: newUrlWithParameters });

  }

  handleHeadersChanged(headers: TableRow[]){
    this.req.headers = headers;
    this.tabItemService.updateRequest(this.req.id, { headers: headers });
  }

  @HostListener('click')
  public closeBodyTypes(){
    this.isShowBodyTypes = false;
  }

  isEmptyRow(row: TableRow){
    return row.name === '' && row.value === '' 
  }

  buildMultipartBody(body: TableRow[]) : MultipartField[] {
    const fields: MultipartField[] = [];

    for (let index = 0; index < body.length; index++) {
      const tabItem = body[index];
      if (!tabItem.isActive) continue;
      if(this.isEmptyRow(tabItem)) continue;

      if (
        tabItem.multipartInfo?.fileValue !== null &&
        tabItem.multipartInfo?.fileValue !== undefined
      ) {
        const fileValue = tabItem.multipartInfo.fileValue;

        if (tabItem.multipartInfo?.contentType) {
          // Создаем файл с кастомным Content-Type
          const customFile = new File(
            [fileValue],
            fileValue.name,
            { type: tabItem.multipartInfo.contentType }
          );
         fields.push( {
            id: tabItem.id,
            type: "file",
            key: tabItem.name,
            file: customFile,
            contentType: tabItem.multipartInfo.contentType,
            isActive: tabItem.isActive
          });
        } else {
          fields.push( {
            id: tabItem.id,
            type: "file",
            key: tabItem.name,
            file: fileValue,
            isActive: tabItem.isActive,
            contentType: null
          });
        }
      }
      else {
        // if (tabItem.multipartInfo?.contentType){
        //   formData.append(tabItem.name, new Blob([tabItem.value], { type: tabItem.multipartInfo.contentType }));
        // }
        // else {
          fields.push( {
            id: tabItem.id,
            type: "text",
            key: tabItem.name,
            value: tabItem.value,
            isActive: tabItem.isActive,
            contentType: null
          });
        // } Посмотрел в bruno, ему на кастоный контент тайп именно у НЕ файла все ровно, так что отправляем без него
      }
    };

    return fields;
  }
}


