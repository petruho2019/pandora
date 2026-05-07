import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { ModalHeader } from '../../../../../../../reuseable/modals/modal-header/modal-header';

@Component({
  selector: 'clear-cookie-modal',
  imports: [ModalHeader],
  templateUrl: './clear-cookie-modal.html',
  styleUrl: './clear-cookie-modal.css',
})
export class ClearCookieModal implements OnInit {
  protected headerTitle: string;

  @Input() isDeleteCookie: boolean;
  @Input() domainNameToDelete: string;
  @Input() cookieNameToDelete: string;

  @Output() onClose = new EventEmitter();
  @Output() onDeleteCookie = new EventEmitter();
  @Output() onDeleteDomain = new EventEmitter();

  ngOnInit(): void {
    this.headerTitle = !this.isDeleteCookie ? 'Очистить cookies по домену' : 'Удалить cookie';
  }

  handleDeleteCookie() {
    this.onDeleteCookie.emit();
  }

  handleDeleteDomain() {
    this.onDeleteDomain.emit();
  }

  handleClose(): void {
    this.onClose.emit();
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') this.handleClose();
  }
}
