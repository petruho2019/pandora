import { NgClass } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, inject, input, Input, model, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RequestChangeDetectorService } from '../../../../../../../services/request-change-detector-service';
import { RequestModel, RequestTypes } from '../../../../../../../shared/models/requests/request';
import { HttpMethod } from '../../../../../../../shared/models/requests/http/http-request-model';

@Component({
  selector: 'request-url',
  imports: [NgClass, FormsModule],
  templateUrl: './request-url.html',
  styleUrl: './request-url.css',
})
export class RequestUrl {
  
  @ViewChild('url') urlCon: ElementRef<HTMLElement>

  @Input() req: RequestModel;
  @Input() isReqChanged: boolean;
  @Output() urlChanged = new EventEmitter<string>();
  @Output() methodChanged = new EventEmitter<HttpMethod>();

  public showMethods = false;
  public methods: HttpMethod[] = [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'HEAD',
    'OPTIONS',
  ];

  selectMethod(method: HttpMethod) {
    this.methodChanged.emit(method);
    this.showMethods = false;
  }

  toggleMethods() {
    this.showMethods = !this.showMethods;
  }

  handleUrlChanged(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.urlChanged.emit(value);
  }

  showPlaceholder(){
    if(!this.urlCon.nativeElement.textContent.trim().length){
      this.urlCon.nativeElement.textContent = null;
    }
  }

  isHttp(){
    return this.req.type === RequestTypes.HTTP;
  }

  @HostListener('document:click')
  onClick() {
    this.showMethods = false;
  }
}
