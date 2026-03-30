import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { ModalHeader } from "../../../../reuseable/modals/modal-header/modal-header";

@Component({
  selector: 'delete-request-modal',
  imports: [ModalHeader],
  templateUrl: './delete-request-modal.html',
  styleUrl: './delete-request-modal.css',
})
export class DeleteRequestModal {

  headerTitle: string = 'Удалить запрос';

  @Input() requestName: string;
  @Input() requestId: string;

  @Output() onClose = new EventEmitter();
  @Output() onDelete = new EventEmitter<string>();

  deleteRequest(){
    this.onDelete.emit(this.requestId!);
  }
  
  close(){
    this.onClose.emit();
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if(event.key === 'Escape')
      this.close();
  }

}
