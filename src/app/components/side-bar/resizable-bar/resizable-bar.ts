import { MAX_SIDEBAR_WIDTH_PX, MIN_SIDEBAR_WIDTH_PX } from './../../../../../shared/models/constants';
import { CdkDragMove, DragDropModule } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'resizable-bar',
  imports: [DragDropModule],
  templateUrl: './resizable-bar.html',
  styleUrl: './resizable-bar.css',
})
export class ResizableBar {

  @Output() onWidthChanged = new EventEmitter<any>();


  protected onDragMoved(event: CdkDragMove){
    const resizerEl = event.source.element.nativeElement;
    
    let newWidth = event.pointerPosition.x;

    if(newWidth < MIN_SIDEBAR_WIDTH_PX) newWidth = MIN_SIDEBAR_WIDTH_PX;
    if(newWidth > MAX_SIDEBAR_WIDTH_PX) newWidth = MAX_SIDEBAR_WIDTH_PX;
    
    this.onWidthChanged.emit(newWidth);

    const element = event.source.element.nativeElement;
    resizerEl.style.transform = 'none';
  }
}
