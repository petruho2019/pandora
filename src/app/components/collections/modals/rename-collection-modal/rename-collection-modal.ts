import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { ModalHeader } from "../../../reuseable/modal-header/modal-header";
import { FormsModule } from '@angular/forms';
import { RenameCollectionDto } from '../../../../../../shared/models/collections/dto/collection-action-dtos';

@Component({
  selector: 'rename-collection-modal',
  imports: [ModalHeader, FormsModule],
  templateUrl: './rename-collection-modal.html',
  styleUrl: './rename-collection-modal.css',
})
export class RenameCollectionModal {

  headerTitle: string = "Переименовать коллекцию"

  @Input() collectionId: string;
  @Input() collectionName: string;
  @Output() onClose = new EventEmitter();
  @Output() onRename = new EventEmitter<RenameCollectionDto>();

  renameCollection(){

    console.log(`Rename collection , name: ${this.collectionName}`);

    this.onRename.emit({collectionName: this.collectionName, collectionId: this.collectionId});
    this.close();
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if(event.key === 'Escape')
      this.close();
  }

  close(){
    this.onClose.emit();
  }

}
