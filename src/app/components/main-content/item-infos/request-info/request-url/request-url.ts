import { NgClass } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  input,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RequestModel, RequestTypes } from '../../../../../../../shared/models/requests/request';
import { HttpMethod } from '../../../../../../../shared/models/requests/http/http-request-model';
import { TabItem } from '../../../../../../../shared/models/utils';

@Component({
  selector: 'request-url',
  imports: [NgClass, FormsModule],
  templateUrl: './request-url.html',
  styleUrl: './request-url.css',
})
export class RequestUrl {
  @ViewChild('url') urlCon: ElementRef<HTMLElement>;

  req = input<RequestModel>();
  @Input() isReqChanged: boolean;

  @Output() onUrlChanged = new EventEmitter<string>();
  @Output() onMethodChanged = new EventEmitter<HttpMethod>();
  @Output() onSend = new EventEmitter<HttpMethod>();
  @Output() onSave = new EventEmitter();
  @Output() onCancel = new EventEmitter();

  isReqSended = input<boolean>();

  public showMethods = false;
  public methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

  selectMethod(method: HttpMethod) {
    this.onMethodChanged.emit(method);
    this.showMethods = false;
  }

  toggleMethods() {
    this.showMethods = !this.showMethods;
  }

  handleUrlChanged(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.onUrlChanged.emit(value);
  }

  handleSaveRequest() {
    this.onSave.emit();
  }

  showPlaceholder() {
    if (!this.urlCon.nativeElement.textContent.trim().length) {
      this.urlCon.nativeElement.textContent = null;
    }
  }

  isHttp() {
    return this.req()!.type === RequestTypes.HTTP;
  }

  @HostListener('document:click')
  onClick() {
    this.showMethods = false;
  }

  handleSendRequest() {
    this.onSend.emit();
  }

  handleCancelRequest() {
    this.onCancel.emit();
  }
}
