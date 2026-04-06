import { Component, EventEmitter, HostListener, inject, Input, Output } from '@angular/core';
import { ModalHeader } from '../../../../reuseable/modals/modal-header/modal-header';
import { CloseCollectionInfo } from '../../../../../../../shared/models/collections/dto/collection-action-dtos';

@Component({
  selector: 'remove-collection-modal',
  imports: [ModalHeader],
  templateUrl: './remove-collection-modal.html',
  styleUrl: './remove-collection-modal.css',
})
export class RemoveCollectionModal {

  headerTitle: string = "Закрыть коллекцию";
  fileInputLabel: string = "Путь"
  fileInputPlaceholder: string = "Путь к коллекции"

  canBeEdit: boolean = false;
  
  @Input() collectionInfo: CloseCollectionInfo;
  @Output() onClose = new EventEmitter();
  @Output() onRemove = new EventEmitter();

  removeCollection(){
    this.onRemove.emit(this.collectionInfo.collectionId);
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
