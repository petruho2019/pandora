import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CloseModalIcon } from "../close-modal-icon/close-modal-icon";

@Component({
  selector: 'modal-header',
  imports: [CloseModalIcon],
  templateUrl: './modal-header.html',
  styleUrl: './modal-header.css',
})
export class ModalHeader {

  @Input() canShowWarningIcon: boolean;
  @Input() title: string;
  @Output() onClose = new EventEmitter();


  close(){
    this.onClose.emit();
  }
}
