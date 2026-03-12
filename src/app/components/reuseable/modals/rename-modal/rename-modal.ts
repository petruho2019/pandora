import { RenameDto } from './../../../../../../shared/models/dto/shared-dtos';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { ModalHeader } from "../modal-header/modal-header";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'rename-modal',
  imports: [ModalHeader, FormsModule],
  templateUrl: './rename-modal.html',
  styleUrl: './rename-modal.css',
})
export class RenameModal {
  
  @Input() headerTitle: string;
  @Input() itemId: string;
  @Input() newName: string;
  @Input() namePlaceholder: string;
  @Output() onClose = new EventEmitter();
  @Output() onRename = new EventEmitter<RenameDto>();

  rename(){
    console.log(`Rename , name: ${this.newName}`);

    this.onRename.emit({name: this.newName, id: this.itemId});
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
