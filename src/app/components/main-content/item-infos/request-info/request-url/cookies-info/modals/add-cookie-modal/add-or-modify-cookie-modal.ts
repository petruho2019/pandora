import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { ModalHeader } from '../../../../../../../reuseable/modals/modal-header/modal-header';
import { FormsModule } from '@angular/forms';
import { CookieModel } from '../../../../../../../../../../shared/models/requests/http/http-request-model';
import { v4 as uuidv4 } from 'uuid';
import { NgClass } from '@angular/common';

export interface CookieDraft {
  domain: string;
  path: string;
  name: string;
  value: string;
  expiresAt: string | null;
  secure: boolean;
  httpOnly: boolean;
}

@Component({
  selector: 'add-or-modify-cookie-modal',
  imports: [ModalHeader, FormsModule, NgClass],
  templateUrl: './add-or-modify-cookie-modal.html',
  styleUrl: './add-or-modify-cookie-modal.css',
})
export class AddCookieModal implements OnInit {
  headerTitle: string;

  @Input() isAddCookie: boolean;
  @Input({ required: false }) cookieToModify: CookieModel;

  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<CookieModel>();
  @Output() onModify = new EventEmitter<CookieModel>();

  protected cookieModel: CookieModel = {
    id: uuidv4(),
    domain: '',
    path: '/',
    name: '',
    value: '',
    expiresAt: null,
    secure: false,
    httpOnly: false,
  };

  ngOnInit(): void {
    this.headerTitle = this.isAddCookie ? 'Добавить cookie' : 'Изменить cookie';
    if (this.cookieToModify)
      this.cookieModel = {
        id: this.cookieToModify.id,
        domain: this.cookieToModify.domain,
        path: this.cookieToModify.path,
        name: this.cookieToModify.name,
        value: this.cookieToModify.value,
        expiresAt: this.cookieToModify.expiresAt,
        secure: this.cookieToModify.secure,
        httpOnly: this.cookieToModify.httpOnly,
      };
  }

  handleClose(): void {
    this.onClose.emit();
  }

  handleSaveCookie(): void {
    if (this.isAddCookie) {
      this.onSave.emit({
        ...this.cookieModel,
        domain: this.cookieModel.domain.trim(),
        path: this.cookieModel.path.trim() || '/',
        name: this.cookieModel.name.trim(),
        value: this.cookieModel.value,
      });
    } else {
      this.onModify.emit({
        ...this.cookieModel,
        value: this.cookieModel.value,
        expiresAt: this.cookieModel.expiresAt,
      });
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') this.handleClose();
  }
}
