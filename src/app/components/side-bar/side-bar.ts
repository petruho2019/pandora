import { DragDropModule } from '@angular/cdk/drag-drop';
import { Component, Input, signal, Output, EventEmitter, ViewChild, HostListener, inject } from '@angular/core';
import { SideBarContent } from "./side-bar-content/side-bar-content";
import { ResizableBar } from './resizable-bar/resizable-bar';
import { RenameDto } from '../../../../shared/models/dto/shared-dtos';
import { CloseCollectionInfo } from '../../../../shared/models/collections/dto/collection-action-dtos';
import { ActionMenuService } from '../../../../services/actions-menu-service';
import { DEFAULT_SIDEBAR_WIDTH_PX } from '../../../../shared/models/constants';

@Component({
  selector: 'side-bar',
  imports: [DragDropModule, ResizableBar, SideBarContent],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.css',
})
export class SideBarComponent {
  @ViewChild(SideBarContent) sidebarContent: SideBarContent;

  protected defaultWidth = DEFAULT_SIDEBAR_WIDTH_PX;
  public currentWidth = signal(this.defaultWidth);

  @Output() widthChanged = new EventEmitter<number>();

  updateCurrentWidth(newWidth: number) {
    this.currentWidth.set(newWidth);
    this.widthChanged.emit(newWidth);
  }

  openCollection() {
    this.sidebarContent.openCollectionRef();
  }

  showAddCollectionModal() {
    this.sidebarContent.showAddCollectionModalRef();
  }

  renameCollection(collInfo: RenameDto) {
    this.sidebarContent.renameCollectionRef(collInfo);
  }

  openCollectionInFS(collId: string) {
    this.sidebarContent.openCollectionInFSRef(collId);
  }

  closeCollection(collInfo: CloseCollectionInfo) {
    this.sidebarContent.closeCollectionRef(collInfo);
  }


}
