import { DragDropModule } from '@angular/cdk/drag-drop';
import { Component, Input, signal, Output, EventEmitter, ViewChild } from '@angular/core';
import { SideBarContent } from "./side-bar-content/side-bar-content";
import { ResizableBar } from './resizable-bar/resizable-bar';
import { RenameDto } from '../../../../shared/models/dto/shared-dtos';
import { CloseCollectionInfo } from '../../../../shared/models/collections/dto/collection-action-dtos';

@Component({
  selector: 'side-bar',
  imports: [DragDropModule, ResizableBar, SideBarContent],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.css',
})
export class SideBarComponent {
    

    @ViewChild(SideBarContent) sidebarContent: SideBarContent;

    protected defaultWidth = 300;
    protected currentWidth = signal(this.defaultWidth);

    updateCurrentWidth(newWidth: any){
      this.currentWidth.set(newWidth);
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
