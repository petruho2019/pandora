import { NgClass } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  input,
  Input,
  Output,
  TemplateRef,
  viewChild,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RequestModel, RequestTypes } from '../../../../../../../shared/models/requests/request';
import {
  CookieModel,
  HttpMethod,
} from '../../../../../../../shared/models/requests/http/http-request-model';
import {
  CookieActionDto,
  CookieInfo,
  DeleteCookieActionDto,
  DeleteDomainActionDto,
} from './cookies-info/cookies-info';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { buildOverlayRef } from '../../../../../app';
import { TemplatePortal } from '@angular/cdk/portal';

@Component({
  selector: 'request-url',
  imports: [NgClass, FormsModule, CookieInfo],
  templateUrl: './request-url.html',
  styleUrl: './request-url.css',
})
export class RequestUrl {
  private overlay = inject(Overlay);
  private viewContainerRef = inject(ViewContainerRef);

  @ViewChild('url') urlCon: ElementRef<HTMLElement>;

  req = input<RequestModel>();

  @Input() isReqChanged: boolean;

  @Output() onUrlChanged = new EventEmitter<string>();
  @Output() onMethodChanged = new EventEmitter<HttpMethod>();
  @Output() onSend = new EventEmitter<HttpMethod>();
  @Output() onSave = new EventEmitter();
  @Output() onCancel = new EventEmitter();
  @Output() onAddCookie = new EventEmitter<CookieActionDto>();
  @Output() onModifyCookie = new EventEmitter<CookieActionDto>();
  @Output() onDeleteCookie = new EventEmitter<DeleteCookieActionDto>();
  @Output() onDeleteDomain = new EventEmitter<DeleteDomainActionDto>();

  isReqSended = input<boolean>();

  cookieInfoPortal = viewChild.required<TemplateRef<any>>('cookie');
  cookieInfoOverlayRef: OverlayRef;

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

  handleAddCookie(cookieDto: CookieActionDto) {
    this.onAddCookie.emit({ cookie: cookieDto.cookie, overlayRef: cookieDto.overlayRef });
  }
  handleModifyCookie(cookieDto: CookieActionDto) {
    this.onModifyCookie.emit({ cookie: cookieDto.cookie, overlayRef: cookieDto.overlayRef });
  }

  handleDeleteCookie(cookieInfo: DeleteCookieActionDto) {
    this.onDeleteCookie.emit(cookieInfo);
  }
  handleDeleteDomain(domainInfo: DeleteDomainActionDto) {
    this.onDeleteDomain.emit(domainInfo);
  }
  showCookieInfo() {
    this.cookieInfoOverlayRef = buildOverlayRef(this.overlay);
    const portal = new TemplatePortal(this.cookieInfoPortal(), this.viewContainerRef);
    this.cookieInfoOverlayRef.attach(portal);
  }
}
