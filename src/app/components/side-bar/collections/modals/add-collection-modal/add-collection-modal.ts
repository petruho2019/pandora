import { SelectFileInput } from './../../../../reuseable/select-file-input/select-file-input';
import { ModalHeader } from './../../../../reuseable/modals/modal-header/modal-header';
import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { FormsModule } from '@angular/forms'
import { AddCollectionDto } from '../../../../../../../shared/models/dto/shared-dtos';

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

  @Output() addCollecton = new EventEmitter<AddCollectionDto>();

  addCollection() {
    console.log(`Add collection ${this.collectionName} , ${this.collectionPath}`);
    this.addCollecton.emit({ 
        name: this.collectionName, 
        path: this.collectionPath
      });
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
