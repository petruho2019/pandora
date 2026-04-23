import { RequestModel, RequestSettingsTabItems, RequestSettingsTabItemsType } from './../../../../shared/models/requests/request';
import { Component, computed, effect, EventEmitter, HostListener, inject, Output, signal } from "@angular/core";
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
import { AUTH_KIND, AuthKind } from '../../../../shared/models/requests/http/auth';
import { ActionMenuService } from '../../../../services/actions-menu-service';

@Component({
  selector: 'main-content',
  templateUrl: './main-content.html',
  styleUrl: './main-content.css',
  imports: [MainContentHeader, MainContentTabItems, DescriptionContent, RequestInfo],
})
export class MainContent {

  constructor() {
    effect(() => {
      console.log(`Изменился selectedSettingRequestTabItems: ${JSON.stringify(this.selectedSettingRequestTabItems(), null, 2)}`);
    })    
  }

  private tabItemService = inject(TabItemService);
  private workspaceInfoService = inject(WorkspaceInfoService);
  private actionMenuService = inject(ActionMenuService);

  @Output() addCollection = new EventEmitter();
  @Output() openCollection = new EventEmitter();
  @Output() renameCollection = new EventEmitter();
  @Output() openCollectionInFS = new EventEmitter();
  @Output() closeCollection = new EventEmitter();

  initialRequests = signal<Record<string, RequestModel>>({});
  selectedSettingRequestTabItems = signal<Record<string, RequestSettingsTabItemsType>>({});
  selectedRequestBody = signal<Record<string, BodyItem>>({});
  selectedAuthType = signal<Record<string, AuthItem>>({});

  public isRequestChanged = signal(false);

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

    console.log(`selectedSettingRequestTabItems перед проверкой на 1 открытие: ${JSON.stringify(this.selectedSettingRequestTabItems(), null, 2)}`);

    if (!current) {
      console.log(`Добавляем запрос в различные рекорды при первом открытии: ${req.id}`);

      this.selectedSettingRequestTabItems.update(ti => ({
        ...ti,
        [req.id]: RequestSettingsTabItems.PARAMS
      }));

      console.log(`selectedSettingRequestTabItems: ${JSON.stringify(this.selectedSettingRequestTabItems(), null, 2)}`);

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

}
