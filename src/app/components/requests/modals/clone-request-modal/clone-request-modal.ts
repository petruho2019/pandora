import { CloneRequestDto } from './../../../../../../shared/models/requests/dto/request-dtos';
import { Component, EventEmitter, HostListener, inject, Input, Output } from '@angular/core';
import { ModalHeader } from "../../../reuseable/modals/modal-header/modal-header";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'clone-request-modal',
  imports: [ModalHeader, FormsModule],
  templateUrl: './clone-request-modal.html',
  styleUrl: './clone-request-modal.css',
})
export class CloneRequestModal {
  headerTitle: string = "Клонировать запрос";

  canBeEdit: boolean = false;
  
  @Input() requestName: string;
  @Output() onClose = new EventEmitter();
  @Output() onClone = new EventEmitter<CloneRequestDto>();

  newName: string;
  newFileName: string;

  ngOnInit(): void {
    this.newName = `${this.requestName} copy`;
    this.newFileName = this.newName;
  }

  changeFolderNameEditMode(){
    this.canBeEdit = !this.canBeEdit;
  }

  cloneRequest(){
    let requestInfo: CloneRequestDto = {
      newName: this.newName,
      newFileName: this.newFileName
    }

    this.onClone.emit(requestInfo)

    this.onClose.emit();
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
