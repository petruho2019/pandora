import { Component, EventEmitter, inject, Output } from "@angular/core";
import { MainContentHeader } from "./main-content-header/main-content-header";
import { MainContentTabItems } from "./main-content-tab-items/main-content-tab-items";
import { TabItemService } from "../../../../services/tab-item-service";
import { WorkspaceFacadeService } from "../../../../services/workspace-facade-service";
import { WorkspaceInfoService } from "../../../../services/workspace-info-service";
import { TabItem, TabItemTypes } from "../../../../shared/models/utils";
import { GENERAL_INFORMATION_DESCRIPTION_TAB_ITEM_ID } from "../../../../shared/models/constants";
import { DescriptionContent } from "./general-info/description-content/description-content";
import { RenameDto } from "../../../../shared/models/dto/shared-dtos";
import { CloseCollectionInfo } from "../../../../shared/models/collections/dto/collection-action-dtos";

@Component({
  selector: 'main-content',
  templateUrl: './main-content.html',
  styleUrl: './main-content.css',
  imports: [MainContentHeader, MainContentTabItems, DescriptionContent],
})
export class MainContent  {

  private tabItemService = inject(TabItemService);
  private workspaceInfoService = inject(WorkspaceInfoService)

  @Output() addCollection = new EventEmitter();
  @Output() openCollection = new EventEmitter();
  @Output() renameCollection = new EventEmitter();
  @Output() openCollectionInFS = new EventEmitter();
  @Output() closeCollection = new EventEmitter();

  isGeneralInfoDescriptionActiveTabItem() {
    const tabItem = this.tabItemService.getActiveTabItem(this.workspaceInfoService.activeWorkspaceId());
    return this.isGeneralInfoType(tabItem!) && tabItem?.id === GENERAL_INFORMATION_DESCRIPTION_TAB_ITEM_ID;
  }

  isGeneralInfoType(tabItem: TabItem) {
    return tabItem.tabType === TabItemTypes.GeneralInfo;
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
