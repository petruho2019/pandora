import { RequestModel, RequestSettingsTabItems, RequestSettingsTabItemsType } from './../../../../shared/models/requests/request';
import { AfterViewInit, Component, computed, effect, ElementRef, EventEmitter, HostListener, inject, input, Input, model, OnInit, Output, signal, ViewChild } from "@angular/core";
import { MainContentHeader } from "./main-content-header/main-content-header";
import { MainContentTabItems } from "./main-content-tab-items/main-content-tab-items";
import { TabItemService } from "../../../../services/tab-item-service";
import { WorkspaceInfoService } from "../../../../services/workspace-info-service";
import { TabItem, TabItemTypes } from "../../../../shared/models/utils";
import { BODY_KIND, GENERAL_INFORMATION_DESCRIPTION_TAB_ITEM_ID, REQUEST_TAB_ITEM_DEFAULT_NAME } from "../../../../shared/models/constants";
import { DescriptionContent } from "./item-infos/general-info/description-content/description-content";
import { RenameDto } from "../../../../shared/models/dto/shared-dtos";
import { CloseCollectionInfo } from "../../../../shared/models/collections/dto/collection-action-dtos";
import { RequestInfo } from "./item-infos/request-info/request-info";
import { AuthItem, BodyItem } from '../../../../shared/models/requests/http/http-request-model';
import { AUTH_KIND } from '../../../../shared/models/requests/http/auth';
import { Store } from '@ngrx/store';
import { selectRequest } from '../../store/selectors/requests.selector';
import { selectCollection } from '../../store/selectors/collections.selector';
import { updateRequest } from '../../store/actions/requests.actions';
import { createHttpRequest } from '../../store/actions/modal-actions/request-modal.actions';
import { RequestResponseInfo } from "./request-response-info/request-response-info";
import { CdkDrag, CdkDragMove } from '@angular/cdk/drag-drop';

@Component({
  selector: 'main-content',
  templateUrl: './main-content.html',
  styleUrl: './main-content.css',
  imports: [MainContentHeader, MainContentTabItems, DescriptionContent, RequestInfo, RequestResponseInfo, CdkDrag],
})
export class MainContent  {
  private tabItemService = inject(TabItemService);
  private workspaceInfoService = inject(WorkspaceInfoService);
  private store = inject(Store);

  @Output() addCollection = new EventEmitter();
  @Output() openCollection = new EventEmitter();
  @Output() renameCollection = new EventEmitter();
  @Output() openCollectionInFS = new EventEmitter();
  @Output() closeCollection = new EventEmitter();

  initialRequests = signal<Record<string, RequestModel>>({});
  selectedSettingRequestTabItems = signal<Record<string, RequestSettingsTabItemsType>>({});
  selectedRequestBody = signal<Record<string, BodyItem>>({});
  selectedAuthType = signal<Record<string, AuthItem>>({});
  reqInfoHeight = signal<Record<string, number>>({});
  reqResponseHeight = signal<Record<string, number>>({});

  sidebarWidth = input<number>(400);

  @ViewChild(MainContentTabItems) mainContentTabItems: MainContentTabItems;
  @ViewChild('reqInfo') reqInfo: ElementRef<HTMLElement>;
  @ViewChild('reqResponseInfo') reqResponseInfo: ElementRef<HTMLElement>;
  @ViewChild('main') mainContainer!: ElementRef<HTMLElement>;
  @ViewChild('resizer') resizer!: ElementRef<HTMLElement>;

  public isRequestChanged = signal(false);

  private __initHeights = effect(() => {
    const req = this.currentRequest();
    if (!req) return;

    const id = req.id;

    this.reqInfoHeight.update(h => ({
      ...h,
      [id]: h[id] ?? 550
    }));

    this.reqResponseHeight.update(h => ({
      ...h,
      [id]: h[id] ?? 400
    }));
  });

  currentRequest = computed(() => {
    const tabItem = this.tabItemService.getActiveTabItem(
      this.workspaceInfoService.activeWorkspaceId()
    );

    return tabItem?.request?.request ?? null;
  });

  private _ = effect(() => {
    const tabItem = this.tabItemService.getActiveTabItem(
      this.workspaceInfoService.activeWorkspaceId()
    );

    const req = tabItem?.request?.request;
    if (!req) return;

    const id = req.id;
    const current = this.initialRequests()[id];

    if (!current) {
      this.selectedSettingRequestTabItems.update(ti => ({
        ...ti,
        [req.id]: RequestSettingsTabItems.PARAMS
      }));

      this.selectedRequestBody.update(ti => ({
        ...ti,
        [req.id]: req.body?.[BODY_KIND.NONE] ?? {
          kind: BODY_KIND.NONE,
          name: 'Без тела',
          group: 'Other'
        }
      }));

      this.selectedAuthType.update(ai => ({
        ...ai,
        [req.id]: req.auth?.[AUTH_KIND.NONE] ?? {
          kind: AUTH_KIND.NONE,
          name: 'Без аутентификации',
        }
      }));

      this.initialRequests.update(map => ({
        ...map,
        [id]: structuredClone(req)
      }));
    }
  });

  isGeneralInfoDescriptionActiveTabItem() {
    const tabItem = this.tabItemService.getActiveTabItem(this.workspaceInfoService.activeWorkspaceId());
    return this.isGeneralInfoType(tabItem!) && tabItem?.id === GENERAL_INFORMATION_DESCRIPTION_TAB_ITEM_ID;
  }

  isRequestActiveTabItem() {
    const tabItem = this.tabItemService.getActiveTabItem(this.workspaceInfoService.activeWorkspaceId());
    return tabItem!.tabType === TabItemTypes.Request;
  }

  getRequestModel(){
    const tabItem = this.tabItemService.getActiveTabItem(this.workspaceInfoService.activeWorkspaceId());
    console.log(`Вызов метода getRequestModel, был получаен таб айтем : ${tabItem!.id}`);
    return tabItem!.request!.request!;
  }

  isGeneralInfoType(tabItem: TabItem) {
    return tabItem.tabType === TabItemTypes.GeneralInfo;
  }

  handleSaveRequest(tabItem: TabItem, reqAlreadyInStore: boolean) {
    if(reqAlreadyInStore) {
      console.log(`Обновляем запрос в fs: ${JSON.stringify(tabItem.request!.request!, null, 2)}`);
        this.store.select(selectCollection(tabItem.request!.request!.collectionId!))
        .subscribe(col => {
          this.store.dispatch(updateRequest({ actionData: {
            body: { req: tabItem.request!.request!, collPath: col!.path },
            modalOverlayRefs: [this.mainContentTabItems.saveOverlayRef, this.mainContentTabItems.selectCollectionOverlayRef]
          }}));
        });
    }
    else {
      console.log(`Добавляем запрос в fs: ${JSON.stringify(tabItem.request!.request!, null, 2)}`);
      this.store.select(selectCollection(tabItem.request!.request!.collectionId!))
        .subscribe(col => {
          this.store.dispatch(createHttpRequest({ actionData: {
            body: {
              id: tabItem.request!.request!.id,
              collectionId: tabItem.request!.request!.collectionId!,
              method: tabItem.request!.request!.method,
              url: tabItem.request!.request!.url,
              name: tabItem.request!.request!.name,
              collectionPath: col!.path,
              auth: tabItem.request!.request!.auth,
              body: tabItem.request!.request!.body,
              type: 'HTTP'
            },
            modalOverlayRefs: [this.mainContentTabItems.saveOverlayRef, this.mainContentTabItems.selectCollectionOverlayRef],
            successMessage: 'Запрос успешно сохранен'
          }}))
        });
    };
  }

  handleSelectedRequestSettingTabItemChanged(newTabItem: RequestSettingsTabItemsType, reqId: string) {
    this.selectedSettingRequestTabItems.update(items => ({
      ...items,
      [reqId]: newTabItem
    }));
  }
  handleSelectedBodyItemChanged(newBody: BodyItem, reqId: string){
    this.selectedRequestBody.update(items => ({
      ...items,
      [reqId]: newBody
    }));
  }

  handleSelectedAuthItemChanged(newAuth: AuthItem, reqId: string){
    this.selectedAuthType.update(items => ({
      ...items,
      [reqId]: newAuth
    }));
  }

  handleRenameCollection(collInfo: RenameDto) {
    this.renameCollection.emit(collInfo);
  }

  handleOpenInFS(collId: string) {
    this.openCollectionInFS.emit(collId);
  }
  
  handleCloseCollection(collInfo: CloseCollectionInfo) {
    this.closeCollection.emit(collInfo);
  }

  handleAddCollection() {
    this.addCollection.emit();
  }

  handleOpenCollection() {
    this.openCollection.emit();
  }

  getMainContentWidth() {
    return window.innerWidth - this.sidebarWidth();
  }
  
  onResize(event: CdkDragMove) {
    const id = this.currentRequest()!.id;

    const reqInfoTop = this.reqInfo.nativeElement.getBoundingClientRect().top;
    const mainContainerBottom = this.mainContainer.nativeElement.getBoundingClientRect().bottom;
    const resizerHeight = this.resizer.nativeElement.clientHeight;

    // Вся доступная зона только под reqInfo + resizer + reqResponse
    const availableHeight = mainContainerBottom - reqInfoTop;

    const minReqInfoHeight = 230;
    const minReqResponseHeight = availableHeight * 0.2;
    const maxReqInfoHeight = availableHeight - resizerHeight - minReqResponseHeight;

    const y = event.pointerPosition.y;

    let newReqInfoHeight = y - reqInfoTop;

    newReqInfoHeight = Math.max(minReqInfoHeight, newReqInfoHeight);
    newReqInfoHeight = Math.min(maxReqInfoHeight, newReqInfoHeight);

    const newReqResponseHeight = availableHeight - newReqInfoHeight - resizerHeight;

    this.reqInfoHeight.update(heights => ({
      ...heights,
      [id]: newReqInfoHeight
    }));

    this.reqResponseHeight.update(heights => ({
      ...heights,
      [id]: newReqResponseHeight
    }));

    event.source.element.nativeElement.style.transform = 'none';
  }
}
