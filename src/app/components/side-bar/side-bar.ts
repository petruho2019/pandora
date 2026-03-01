import { DragDropModule } from '@angular/cdk/drag-drop';
import { Component, Input, signal } from '@angular/core';
import { ResizableBar } from "../resizable-bar/resizable-bar";
import { CollectionsInfo } from "../collections/collections-info/collections-info";

@Component({
  selector: 'side-bar',
  imports: [DragDropModule, ResizableBar,CollectionsInfo],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.css',
})
export class SideBarResizeComponent {
    protected defaultWidth = 300;
    protected currentWidth = signal(this.defaultWidth);

    updateCurrentWidth(newWidth: any){
      this.currentWidth.set(newWidth);
    }
}
