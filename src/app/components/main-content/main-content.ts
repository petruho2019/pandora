import {
  RequestModel,
  RequestSettingsTabItems,
  RequestSettingsTabItemsType,
  TableRow,
} from './../../../../shared/models/requests/request';
import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  input,
  Input,
  model,
  OnInit,
  Output,
  signal,
  ViewChild,
} from '@angular/core';
import { MainContentHeader } from './main-content-header/main-content-header';
import { MainContentTabItems } from './main-content-tab-items/main-content-tab-items';
import { TabItemService } from '../../../../services/tab-item-service';
import { WorkspaceInfoService } from '../../../../services/workspace-info-service';
import { TabItem, TabItemTypes } from '../../../../shared/models/utils';
import {
  BODY_KIND,
  GENERAL_INFORMATION_DESCRIPTION_TAB_ITEM_ID,
  GENERAL_INFORMATION_WORKSPACE_ID,
  REQUEST_TAB_ITEM_DEFAULT_NAME,
} from '../../../../shared/models/constants';
import { DescriptionContent } from './item-infos/general-info/description-content/description-content';
import { RenameDto } from '../../../../shared/models/dto/shared-dtos';
import { CloseCollectionInfo } from '../../../../shared/models/collections/dto/collection-action-dtos';
import { RequestInfo } from './item-infos/request-info/request-info';
import { AuthItem, BodyItem } from '../../../../shared/models/requests/http/http-request-model';
import { AUTH_KIND } from '../../../../shared/models/requests/http/auth';
import { Store } from '@ngrx/store';
import { selectRequest } from '../../store/selectors/requests.selectors';
import { selectCollection } from '../../store/selectors/collections.selectors';
import {
  createHttpRequest,
  updateRequest,
} from '../../store/actions/modal-actions/request-modal.actions';
import { RequestResponseInfo } from './request-response-info/request-response-info';
import { CdkDrag, CdkDragMove } from '@angular/cdk/drag-drop';
import { take } from 'rxjs';
import { RequestStateService } from '../../../../services/request-state-service';
import { CollectionInfo } from './item-infos/collection-info/collection-info';
import {
  Collection,
  CollectionSettingsTabItems,
  CollectionSettingsTabItemsType,
} from '../../../../shared/models/collections/collection';

@Component({
  selector: 'main-content',
  templateUrl: './main-content.html',
  styleUrl: './main-content.css',
  imports: [
    MainContentHeader,
    MainContentTabItems,
    DescriptionContent,
    RequestInfo,
    RequestResponseInfo,
    CdkDrag,
    CollectionInfo,
  ],
})
export class MainContent {
  private tabItemService = inject(TabItemService);
  private workspaceInfoService = inject(WorkspaceInfoService);
  private store = inject(Store);
  private requestStateService = inject(RequestStateService);

  @Output() addCollection = new EventEmitter();
  @Output() openCollection = new EventEmitter();
  @Output() renameCollection = new EventEmitter();
  @Output() openCollectionInFS = new EventEmitter();
  @Output() closeCollection = new EventEmitter();

  initialRequests = signal<Record<string, RequestModel>>({});
  selectedRequestSettingTabItems = signal<Record<string, RequestSettingsTabItemsType>>({});
  selectedRequestBody = signal<Record<string, BodyItem>>({});
  selectedRequestAuthType = signal<Record<string, AuthItem>>({});

  initialColls = signal<Record<string, Collection>>({});
  selectedCollectionSettingTabItem = signal<Record<string, CollectionSettingsTabItemsType>>({});
  collectionAuthInfos = signal<Record<string, Record<string, AuthItem>>>({});
  selectedCollectionAuthItem = signal<Record<string, AuthItem>>({});
  collectionAuthDraftInfos = signal<Record<string, Record<string, AuthItem>>>({});
  selectedCollectionAuthItemDraft = signal<Record<string, AuthItem>>({});
  collHeaders = signal<Record<string, TableRow[]>>({});

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

    queueMicrotask(() => {
      this.syncHeightsFromLayout();
    });
  });

  currentRequest = computed(() => {
    const tabItem = this.tabItemService.getActiveTabItem(
      this.workspaceInfoService.activeWorkspaceId(),
    );

    return tabItem?.request?.request;
  });

  currentCollTabItem = computed(() => {
    const collId = this.workspaceInfoService.activeWorkspace()?.item?.id;
    return this.tabItemService.getActiveTabItem(collId!)?.collection;
  });

  private initialRequestsEffect = effect(() => {
    const tabItem = this.tabItemService.getActiveTabItem(
      this.workspaceInfoService.activeWorkspaceId(),
    );

    const req = tabItem?.request?.request;
    if (!req) return;

    const id = req.id;
    const current = this.initialRequests()[id];

    if (!current) {
      this.selectedRequestSettingTabItems.update((ti) => ({
        ...ti,
        [req.id]: RequestSettingsTabItems.PARAMS,
      }));

      this.selectedRequestBody.update((ti) => ({
        ...ti,
        [req.id]: req.body?.[BODY_KIND.NONE] ?? {
          kind: BODY_KIND.NONE,
          name: 'Без тела',
          group: 'Other',
        },
      }));

      this.selectedRequestAuthType.update((ai) => ({
        ...ai,
        [req.id]: req.auth?.[AUTH_KIND.NONE] ?? {
          kind: AUTH_KIND.NONE,
          name: 'Без аутентификации',
        },
      }));

      this.initialRequests.update((map) => ({
        ...map,
        [id]: structuredClone(req),
      }));
    }
  });

  private initialCollsEffect = effect(() => {
    const collTabItem = this.tabItemService.getActiveTabItem(
      this.workspaceInfoService.activeWorkspaceId(),
    );

    const coll = collTabItem?.collection;
    if (!coll) return;

    const collId = coll.id;
    const currentCollTabItem = this.initialColls()[collId];

    if (!currentCollTabItem) {
      this.selectedCollectionSettingTabItem.update((ti) => ({
        ...ti,
        [collId]: CollectionSettingsTabItems.OVERVIEW,
      }));

      this.selectedCollectionAuthItem.update((ti) => ({
        ...ti,
        [coll.id]: coll.collectionConfig.collectionSettings.auth?.[BODY_KIND.NONE] ?? {
          kind: BODY_KIND.NONE,
          name: 'Без тела',
          group: 'Other',
        },
      }));

      this.collectionAuthInfos.update((info) => ({
        ...info,
        [collId]: structuredClone(
          coll.collectionConfig.collectionSettings.auth ?? {
            [AUTH_KIND.NONE]: {
              kind: AUTH_KIND.NONE,
              name: 'Без аутентификации',
            },
          },
        ),
      }));

      this.collectionAuthDraftInfos.update((info) => ({
        ...info,
        [collId]: structuredClone(
          coll.collectionConfig.collectionSettings.auth ?? {
            [AUTH_KIND.NONE]: {
              kind: AUTH_KIND.NONE,
              name: 'Без аутентификации',
            },
          },
        ),
      }));

      this.collHeaders.update((ch) => ({
        ...ch,
        [collId]:
          this.workspaceInfoService.activeWorkspace()!.item!.collectionConfig.collectionSettings
            .headers,
      }));

      this.initialColls.update((map) => ({
        ...map,
        [collId]: structuredClone(coll),
      }));
    }
  });

  isGeneralInfoDescriptionActiveTabItem() {
    const tabItem = this.tabItemService.getActiveTabItem(
      this.workspaceInfoService.activeWorkspaceId(),
    );
    return (
      this.isGeneralInfoType(tabItem!) &&
      tabItem?.id === GENERAL_INFORMATION_DESCRIPTION_TAB_ITEM_ID
    );
  }

  isRequestActiveTabItem() {
    const tabItem = this.tabItemService.getActiveTabItem(
      this.workspaceInfoService.activeWorkspaceId(),
    );
    return tabItem!.tabType === TabItemTypes.Request;
  }

  isCollectionActiveTabItem() {
    const tabItem = this.tabItemService.getActiveTabItem(
      this.workspaceInfoService.activeWorkspaceId(),
    );
    return tabItem!.tabType === TabItemTypes.CollectionSettings;
  }

  getRequestModel() {
    const tabItem = this.tabItemService.getActiveTabItem(
      this.workspaceInfoService.activeWorkspaceId(),
    );
    return tabItem!.request!.request!;
  }

  isGeneralInfoType(tabItem: TabItem) {
    return tabItem.tabType === TabItemTypes.GeneralInfo;
  }

  handleClickSaveRequestIcon(req: RequestModel) {
    console.log(`Обрабатываем сохранение запроса: ${req.collectionId}`);
    if (req.collectionId) {
      const tabItem = this.tabItemService.getActiveTabItem(req.collectionId!)!;
      this.store
        .select(selectRequest({ id: req.id! }))
        .pipe(take(1))
        .subscribe((r) => {
          if (r) {
            this.handleSaveRequest(tabItem, false, true);
          } else {
            this.mainContentTabItems.handleShowSelectCollection(
              this.tabItemService.getActiveTabItem(req.collectionId!)!,
              false,
            );
          }
        });
    } else {
      this.mainContentTabItems.handleShowSelectCollection(
        this.tabItemService.getActiveTabItem(GENERAL_INFORMATION_WORKSPACE_ID)!,
        false,
      );
    }
  }

  handleSaveRequest(tabItem: TabItem, needCloseTabItem: boolean, reqAlreadyInStore: boolean) {
    if (reqAlreadyInStore) {
      this.store
        .select(selectCollection(tabItem.request!.request!.collectionId!))
        .subscribe((col) => {
          console.log(`Coll Id: ${col?.id}`);
          this.store.dispatch(
            updateRequest({
              actionData: {
                body: { req: tabItem.request!.request!, collPath: col!.path },
                modalOverlayRefs: [
                  this.mainContentTabItems.saveOverlayRef,
                  this.mainContentTabItems.selectCollectionOverlayRef,
                ],
              },
            }),
          );
        })
        .unsubscribe();
    } else {
      this.store
        .select(selectCollection(tabItem.request!.request!.collectionId!))
        .subscribe((col) => {
          this.store.dispatch(
            createHttpRequest({
              actionData: {
                body: {
                  ...tabItem.request!.request!,
                  collectionId: tabItem.request!.request!.collectionId!,
                  collectionPath: col!.path,
                  type: 'HTTP',
                },
                modalOverlayRefs: [
                  this.mainContentTabItems.saveOverlayRef,
                  this.mainContentTabItems.selectCollectionOverlayRef,
                ],
                successMessage: 'Запрос успешно сохранен',
              },
            }),
          );
        })
        .unsubscribe();
    }

    if (needCloseTabItem) this.mainContentTabItems.closeTabItem(tabItem);
  }

  handleSelectedRequestSettingTabItemChanged(
    newTabItem: RequestSettingsTabItemsType,
    reqId: string,
  ) {
    this.selectedRequestSettingTabItems.update((items) => ({
      ...items,
      [reqId]: newTabItem,
    }));
  }

  handleSelectedCollectionSettingTabItemChanged(
    newTabItem: CollectionSettingsTabItemsType,
    collId: string,
  ) {
    this.selectedCollectionSettingTabItem.update((items) => ({
      ...items,
      [collId]: newTabItem,
    }));
  }

  handleSelectedBodyItemChanged(newBody: BodyItem, reqId: string) {
    this.selectedRequestBody.update((items) => ({
      ...items,
      [reqId]: newBody,
    }));
  }

  handleSelectedAuthItemChanged(newAuth: AuthItem, reqId: string) {
    this.selectedRequestAuthType.update((items) => ({
      ...items,
      [reqId]: newAuth,
    }));
  }

  handleSelectedCollectionAuthItemChanged(authItem: AuthItem) {
    this.selectedCollectionAuthItemDraft.update((items) => ({
      ...items,
      [this.currentCollTabItem()!.id]: authItem,
    }));

    this.handleSelectedCollectionAuthChanged(authItem);
  }

  handleSelectedCollectionAuthChanged(authItem: AuthItem) {
    const collId = this.currentCollTabItem()!.id;

    this.collectionAuthDraftInfos.update((infos) => ({
      ...infos,
      [collId]: {
        ...(infos[collId] ?? {}),
        [authItem.kind]: authItem,
      },
    }));

    console.log(
      `Обновили this.collectionAuthDraftInfos: ${JSON.stringify(this.collectionAuthDraftInfos(), null, 2)}`,
    );
  }

  handleSaveCollectionAuth(event: { auth: AuthItem; collId: string }) {
    console.log(`Обновляем collectionAuthInfos`);
    this.collectionAuthInfos.update((infos) => ({
      ...infos,
      [event.collId]: {
        ...(infos[event.collId] ?? {}),
        [event.auth.kind]: event.auth,
      },
    }));

    this.selectedCollectionAuthItem.update((items) => ({
      ...items,
      [event.collId]: event.auth,
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

  handleAddDefaultRequestTabItem() {
    this.mainContentTabItems.addRequestTabItem();
  }

  getMainContentWidth() {
    return window.innerWidth - this.sidebarWidth();
  }

  getCurrentCollAuth() {
    if (!this.currentCollTabItem()?.id) {
      return;
    }

    return this.collectionAuthInfos()[this.currentCollTabItem()!.id][
      this.selectedCollectionAuthItem()[this.currentCollTabItem()!.id].kind
    ];
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.syncHeightsFromLayout();
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

    this.reqInfoHeight.update((heights) => ({
      ...heights,
      [id]: newReqInfoHeight,
    }));

    this.reqResponseHeight.update((heights) => ({
      ...heights,
      [id]: newReqResponseHeight,
    }));

    event.source.element.nativeElement.style.transform = 'none';
  }

  private syncHeightsFromLayout() {
    const req = this.currentRequest();
    if (!req) return;

    if (
      !this.reqInfo?.nativeElement ||
      !this.reqResponseInfo?.nativeElement ||
      !this.mainContainer?.nativeElement ||
      !this.resizer?.nativeElement
    ) {
      return;
    }

    const id = req.id;

    const reqInfoTop = this.reqInfo.nativeElement.getBoundingClientRect().top;
    const mainContainerBottom = this.mainContainer.nativeElement.getBoundingClientRect().bottom;
    const resizerRect = this.resizer.nativeElement.getBoundingClientRect();

    const availableHeight = mainContainerBottom - reqInfoTop;
    const resizerHeight = resizerRect.height;

    const minReqInfoHeight = 230;

    let newReqInfoHeight = resizerRect.top - reqInfoTop;
    newReqInfoHeight = Math.max(minReqInfoHeight, newReqInfoHeight);

    const newReqResponseHeight = Math.max(0, availableHeight - newReqInfoHeight - resizerHeight);

    this.reqInfoHeight.update((heights) => ({
      ...heights,
      [id]: newReqInfoHeight,
    }));

    this.reqResponseHeight.update((heights) => ({
      ...heights,
      [id]: newReqResponseHeight,
    }));
  }
}
