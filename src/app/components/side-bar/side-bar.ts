import { Collection } from './../../../../shared/models/collections/collection';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Component, Input, signal, Output, EventEmitter } from '@angular/core';
import { SideBarContent } from "./side-bar-content/side-bar-content";
import { ResizableBar } from './resizable-bar/resizable-bar';

@Component({
  selector: 'side-bar',
  imports: [DragDropModule, ResizableBar, SideBarContent],
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
