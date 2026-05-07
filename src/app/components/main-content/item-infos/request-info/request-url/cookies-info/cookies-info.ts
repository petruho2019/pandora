import {
  Component,
  computed,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnInit,
  Output,
  signal,
  SimpleChanges,
  TemplateRef,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { ModalHeader } from '../../../../../reuseable/modals/modal-header/modal-header';
import { CookieModel } from '../../../../../../../../shared/models/requests/http/http-request-model';
import { AddCookieModal } from './modals/add-cookie-modal/add-or-modify-cookie-modal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { buildOverlayRef } from '../../../../../../app';
import { TemplatePortal } from '@angular/cdk/portal';
import { Store } from '@ngrx/store';
import { loadCookies } from '../../../../../../store/actions/cookies.actions';
import { selectAll } from '../../../../../../store/selectors/cookies.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { TEST_COOKIES } from '../../../../../../store/reducers/cookie.reducer';
import { ClearCookieModal } from './modals/delete-cookie-modal/delete-cookie-modal';

export interface CookieDomainGroup {
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
  imports: [ModalHeader, AddCookieModal, ClearCookieModal],
  templateUrl: './cookies-info.html',
  styleUrl: './cookies-info.css',
})
export class CookieInfo implements OnInit {
  private overlay = inject(Overlay);
  private viewContainerRef = inject(ViewContainerRef);
  private store = inject(Store);

  @Output() onClose = new EventEmitter<void>();
  @Output() onAddCookie = new EventEmitter<CookieActionDto>();
  @Output() onModifyCookie = new EventEmitter<CookieActionDto>();
  @Output() onDeleteCookie = new EventEmitter<DeleteCookieActionDto>();
  @Output() onDeleteDomain = new EventEmitter<DeleteDomainActionDto>();

  ngOnInit(): void {
    this.store.dispatch(loadCookies());
  }

  private cookies$ = this.store.select(selectAll);
  public cookies = toSignal(this.cookies$);
  // public cookies = signal<CookieModel[]>(TEST_COOKIES);

  cookieGroups = computed(() => {
    try {
      const cookieGroup: CookieDomainGroup[] = [];

      for (const cook of this.cookies()!) {
        if (cookieGroup.find((cg) => cg.domain === cook.domain)) continue;

        cookieGroup.push({
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cookieGroups']) {
      this.syncExpandedDomains();
    }
  }

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

  showAddCookieModal() {
    this.isAddCookie = true;

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
}
