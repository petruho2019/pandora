import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'close-modal-icon',
  imports: [],
  templateUrl: './close-modal-icon.html',
  styleUrl: './close-modal-icon.css',
})
export class CloseModalIcon {

  @Output() close = new EventEmitter();

  click(){
    this.close.emit();
  }
}
