import {
  Component,
  computed,
  effect,
  EventEmitter,
  HostListener,
  inject,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { ModalHeader } from '../../../../../reuseable/modals/modal-header/modal-header';
import { CookieModel } from '../../../../../../../../shared/models/requests/http/http-request-model';
import { AddCookieModal } from './modals/add-cookie-modal/add-or-modify-cookie-modal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { buildOverlayRef } from '../../../../../../app';
import { TemplatePortal } from '@angular/cdk/portal';
import { Store } from '@ngrx/store';
import { selectAll } from '../../../../../../store/selectors/cookies.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { TEST_COOKIES } from '../../../../../../store/reducers/cookie.reducer';
import { ClearCookieModal } from './modals/delete-cookie-modal/delete-cookie-modal';
import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { AlertNotificationService } from '../../../../../../../../services/alert-notification-service';
import { CloseModalIcon } from '../../../../../reuseable/close-modal-icon/close-modal-icon';
import { NgClass } from '@angular/common';

export interface CookieDomainGroup {
  id: string;
  domain: string;
  cookies: CookieModel[];
}

export interface CookieActionDto {
  cookie: CookieModel;
  overlayRef: OverlayRef;
}

export interface DeleteCookieActionDto {
  cookieId: string;
  overlayRef: OverlayRef;
}

export interface DeleteDomainActionDto {
  domainName: string;
  overlayRef: OverlayRef;
}

@Component({
  selector: 'cookies-info',
  imports: [AddCookieModal, ClearCookieModal, CdkCopyToClipboard, CloseModalIcon, NgClass],
  templateUrl: './cookies-info.html',
  styleUrl: './cookies-info.css',
})
export class CookieInfo {
  private overlay = inject(Overlay);
  private viewContainerRef = inject(ViewContainerRef);
  private store = inject(Store);
  private alertNotificationService = inject(AlertNotificationService);

  @Output() onClose = new EventEmitter<void>();
  @Output() onAddCookie = new EventEmitter<CookieActionDto>();
  @Output() onModifyCookie = new EventEmitter<CookieActionDto>();
  @Output() onDeleteCookie = new EventEmitter<DeleteCookieActionDto>();
  @Output() onDeleteDomain = new EventEmitter<DeleteDomainActionDto>();

  private cookies$ = this.store.select(selectAll);
  public cookies = toSignal(this.cookies$);
  // public cookies = signal<CookieModel[]>(TEST_COOKIES);

  cookieGroups = computed(() => {
    try {
      const cookieGroup: CookieDomainGroup[] = [];

      for (const cook of this.cookies()!) {
        if (cookieGroup.find((cg) => cg.domain === cook.domain)) continue;

        cookieGroup.push({
          id: uuidv4(),
          domain: cook.domain,
          cookies: this.cookies()!.filter((c) => c.domain === cook.domain),
        });
      }

      return cookieGroup;
    } catch (error) {
      console.log(`${error}`);
    }

    return [];
  });

  isAddCookie: boolean;
  isDeleteCookie: boolean;

  addCookiePortal = viewChild.required<TemplateRef<any>>('addOrModifyCookie');
  addCookieOverlayRef: OverlayRef;
  domainNameToAddCookie: string | null;

  modifyCookiePortal = viewChild.required<TemplateRef<any>>('addOrModifyCookie');
  modifyCookieOverlayRef: OverlayRef;
  cookieToModify: CookieModel;

  deleteCookiePortal = viewChild.required<TemplateRef<any>>('delete');
  deleteCookieOverlayRef: OverlayRef;
  cookieIdToDelete: string;
  cookieNameToDelete: string;

  deleteDomainPortal = viewChild.required<TemplateRef<any>>('delete');
  deleteDomainOverlayRef: OverlayRef;
  domainToDelete: string;

  protected headerTitle = 'Cookies';

  protected expandedDomains = new Set<string>();

  private syncExpandedDomainsEffect = effect(() => {
    const groups = this.cookieGroups();

    if (!groups.length) {
      this.expandedDomains.clear();
      return;
    }

    const existingDomains = new Set(groups.map((group) => group.domain));
    const nextExpanded = new Set<string>();

    for (const domain of this.expandedDomains) {
      if (existingDomains.has(domain)) {
        nextExpanded.add(domain);
      }
    }

    this.expandedDomains = nextExpanded;

    if (this.expandedDomains.size === 0) {
      this.expandedDomains.add(groups[0].domain);
    }
  });

  handleClose(): void {
    this.onClose.emit();
  }

  toggleDomain(domain: string): void {
    if (this.expandedDomains.has(domain)) {
      this.expandedDomains.delete(domain);
    } else {
      this.expandedDomains.add(domain);
    }
  }

  isExpanded(domain: string): boolean {
    return this.expandedDomains.has(domain);
  }

  handleAddOrModifyCookie(cookie: CookieModel): void {
    if (this.isAddCookie)
      this.onAddCookie.emit({ cookie: cookie, overlayRef: this.addCookieOverlayRef });
    else {
      this.onModifyCookie.emit({ cookie: cookie, overlayRef: this.modifyCookieOverlayRef });
    }
  }

  handleOnCloseAddOrModifyCookie() {
    if (this.isAddCookie) this.addCookieOverlayRef.detach();
    else this.modifyCookieOverlayRef.detach();
  }

  handleOnCloseDeleteCookie() {
    if (this.isDeleteCookie) this.deleteCookieOverlayRef.detach();
    else this.deleteDomainOverlayRef.detach();
  }

  handleDeleteCookie(): void {
    this.onDeleteCookie.emit({
      cookieId: this.cookieIdToDelete,
      overlayRef: this.deleteCookieOverlayRef,
    });
  }

  handleDeleteDomain() {
    this.onDeleteDomain.emit({
      domainName: this.domainToDelete,
      overlayRef: this.deleteDomainOverlayRef,
    });
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.handleClose();
    }
  }

  showDeleteDomainModal(domain: string): void {
    this.isDeleteCookie = false;
    this.domainToDelete = domain;

    this.deleteDomainOverlayRef = buildOverlayRef(this.overlay);
    const portal = new TemplatePortal(this.deleteDomainPortal(), this.viewContainerRef);
    this.deleteDomainOverlayRef.attach(portal);
  }

  showDeleteCookieModal(id: string, name: string): void {
    this.isDeleteCookie = true;
    this.cookieIdToDelete = id;
    this.cookieNameToDelete = name;

    this.deleteCookieOverlayRef = buildOverlayRef(this.overlay);
    const portal = new TemplatePortal(this.deleteCookiePortal(), this.viewContainerRef);
    this.deleteCookieOverlayRef.attach(portal);
  }

  showAddCookieModal(domainNameToAddCookie?: string) {
    this.isAddCookie = true;
    this.domainNameToAddCookie = domainNameToAddCookie === undefined ? null : domainNameToAddCookie;

    this.addCookieOverlayRef = buildOverlayRef(this.overlay);
    const portal = new TemplatePortal(this.addCookiePortal(), this.viewContainerRef);
    this.addCookieOverlayRef.attach(portal);
  }

  showModifyCookieModal(cookieToModify: CookieModel) {
    this.isAddCookie = false;
    this.cookieToModify = cookieToModify;

    this.modifyCookieOverlayRef = buildOverlayRef(this.overlay);
    const portal = new TemplatePortal(this.modifyCookiePortal(), this.viewContainerRef);
    this.modifyCookieOverlayRef.attach(portal);
  }

  private syncExpandedDomains(): void {
    if (!this.cookieGroups?.length) {
      this.expandedDomains.clear();
      return;
    }

    const existingDomains = new Set(this.cookieGroups()?.map((group) => group.domain));
    const nextExpanded = new Set<string>();

    for (const domain of this.expandedDomains) {
      if (existingDomains.has(domain)) {
        nextExpanded.add(domain);
      }
    }

    this.expandedDomains = nextExpanded;

    if (this.expandedDomains.size === 0) {
      this.expandedDomains.add(this.cookieGroups()![0].domain);
    }
  }

  addAlertNotificationCopiedSuccess() {
    return this.alertNotificationService.addAlertNotification({
      message: 'Значение cookie успешно скопированно',
      showSuccess: true,
    });
  }
}
