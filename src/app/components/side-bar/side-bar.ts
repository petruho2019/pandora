import { DragDropModule } from '@angular/cdk/drag-drop';
import { Component, Input, signal } from '@angular/core';
import { ResizableBar } from "../resizable-bar/resizable-bar";
import { SideBarContent } from "./side-bar-content/side-bar-content";

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
