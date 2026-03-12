import { Component, EventEmitter, HostListener, inject, Output } from '@angular/core';
import { FormsModule } from '@angular/forms'
import { SelectFileInput } from "../../../select-file-input/select-file-input";
import { ModalHeader } from '../../../reuseable/modals/modal-header/modal-header';

@Component({
  selector: 'add-collection-modal',
  imports: [FormsModule, ModalHeader, SelectFileInput],
  templateUrl: './add-collection-modal.html',
  styleUrl: './add-collection-modal.css',
})
export class AddCollectionModal {
    
  collectionName = '';
  collectionPath = '';

  headerTitle = "Создать коллекцию";
  fileInputPlaceholder = "Путь до коллекции";
  fileInputLabel = "Путь";

  @Output() closeModal = new EventEmitter();

  @Output() addCollecton = new EventEmitter();

  addCollection() {
    console.log(`Add collection ${this.collectionName} , ${this.collectionPath}`);
    this.addCollecton.emit({ 
        name: this.collectionName, 
        path: this.collectionPath
      });

    this.onClose();
    }

  onPathSelected(selectedPath: string){
    this.collectionPath = selectedPath;
  }

  onClose() {
    this.collectionName = '';
    this.collectionPath = '';
    this.closeModal.emit();
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if(event.key === 'Escape')
      this.closeModal.emit();
  }
}
