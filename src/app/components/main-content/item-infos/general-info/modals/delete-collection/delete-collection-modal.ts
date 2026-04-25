import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { ModalHeader } from "../../../../../reuseable/modals/modal-header/modal-header";
import { DeleteCollectionDto } from '../../../../../../../../shared/models/collections/dto/collection-action-dtos';
import { FormsModule } from '@angular/forms';
import { NgClass, NgStyle, NgIf } from '@angular/common';

@Component({
  selector: 'delete-collection-modal',
  imports: [ModalHeader, FormsModule, NgClass],
  templateUrl: './delete-collection-modal.html',
  styleUrl: './delete-collection-modal.css',
})
export class DeleteCollection {

  public headerTitle = 'Удалить коллекцию';

  public deleteTemplate: string = '';

  @Input() collectionInfo: DeleteCollectionDto;

  @Output() onClose = new EventEmitter();
  @Output() onDelete = new EventEmitter();

  deleteCollection(){
    console.log(`Удаление коллекции из модального компонента`);
    this.onDelete.emit(this.collectionInfo.collectionId);
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
