import { inject, Injectable } from "@angular/core";
import { WorkspaceInfoService } from "./workspace-info-service";
import { TabItemService } from "./tab-item-service";
import { GENERAL_INFORMATION_DESCRIPTION_TAB_ITEM_ID, GENERAL_INFORMATION_WORKSPACE_ID } from "../shared/models/constants";
import { Collection } from "../shared/models/collections/collection";
import { RequestModel } from "../shared/models/requests/request";
import { TabItem } from "../shared/models/utils";

@Injectable({ providedIn: 'root' })
export class WorkspaceFacadeService {
  private workspaceInfo = inject(WorkspaceInfoService);
  private tabItemService = inject(TabItemService);

  openGeneralInfo() {
    this.workspaceInfo.setActiveWorkspaceId(GENERAL_INFORMATION_WORKSPACE_ID);
    this.tabItemService.setActiveTabItemId('description');
  }

  openCollection(coll: Collection) {
    const workspaceId = this.workspaceInfo.ensureCollectionWorkspace(coll);
    const tabId = this.tabItemService.ensureCollectionSettingsTabItem(coll, workspaceId);

    this.workspaceInfo.setActiveWorkspaceId(workspaceId);
    this.tabItemService.setActiveTabItemId(tabId);
  }

  addTabItem(request: RequestModel, coll: Collection){
    this.tabItemService.addRequestTabItem(request, coll);
    this.workspaceInfo.setActiveWorkspaceId(coll.id);
  }

  deleteTabItem(tabItemToDelete: TabItem, workspaceId: string){
    let newActiveTabItemId = this.tabItemService.deleteTabItem(tabItemToDelete, workspaceId);

    if(!newActiveTabItemId){
      newActiveTabItemId = GENERAL_INFORMATION_DESCRIPTION_TAB_ITEM_ID;
      this.workspaceInfo.setActiveWorkspaceId(GENERAL_INFORMATION_WORKSPACE_ID);
    }

    this.tabItemService.setActiveTabItemId(newActiveTabItemId);
  }
}