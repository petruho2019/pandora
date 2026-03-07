import { Component, EventEmitter, HostListener, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpMethod } from '../../../../../../shared/models/requests/http-request-model';
import { RequestType, RequestTypes } from '../../../../../../shared/models/requests/request';
import { CreateRequestInfo } from '../../../../../../shared/models/event-models/add-request-info';
import { ModalHeader } from "../../../reuseable/modal-header/modal-header";

@Component({
  selector: 'add-request-modal',
  imports: [CommonModule, FormsModule, ModalHeader],
  templateUrl: './add-request-modal.html',
  styleUrl: './add-request-modal.css',
})
export class AddRequestModal {


  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<CreateRequestInfo>();
  @Input() collectionId: string; 

  headerTitle: string = "Добавить запрос"

  type: RequestType = RequestTypes.HTTP;
  name = '';
  url = '';
  selectedMethod: HttpMethod = 'GET';
  methods: HttpMethod[] = [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'HEAD',
    'OPTIONS',
  ];

  showMethods = false;

  toggleMethods() {
    this.showMethods = !this.showMethods;
  }

  selectMethod(method: HttpMethod) {
    this.selectedMethod = method;
    this.showMethods = false;
  }

  onCreate() {
    console.log(`OnCreate add-request-modal , ${this.type}`);

    if (!this.name.trim()) return;

    if (this.type === RequestTypes.HTTP) {
      console.log(`Create request http`);
      this.create.emit({
        type: RequestTypes.HTTP,
        name: this.name.trim(),
        method: this.selectedMethod,
        url: this.url.trim(),
        collectionId: this.collectionId
      });
    }

    // if (this.type === 'gRPC') {
    //   this.create.emit({
    //     type: 'gRPC',
    //     name: this.name.trim(),
    //     protoPath: this.protoPath,
    //     service: this.service,
    //     methodName: this.methodName,
    //   });
    // }

    this.close.emit();
  }

  onClose() {
    this.close.emit();
  }

  @HostListener('document:click')
  onClick() {
    this.showMethods = false;
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if(event.key === 'Escape')
      this.close.emit();
  }
}
