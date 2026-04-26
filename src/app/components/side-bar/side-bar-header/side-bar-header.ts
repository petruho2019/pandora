import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { Component, inject, TemplateRef, viewChild, ViewContainerRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { ActionMenuService } from '../../../../../services/actions-menu-service';
import { CdkPortal, PortalModule } from '@angular/cdk/portal';
import { take } from 'rxjs';
import { openCollection } from '../../../store/actions/collections.actions';
import { CommonModule } from '@angular/common';
import { AddCollectionModal } from '../collections/modals/add-collection-modal/add-collection-modal';
import { addCollectionModal } from '../../../store/actions/modal-actions/collections-modal.actions';
import { AddCollectionDto } from '../../../../../shared/models/dto/shared-dtos';

@Component({
  selector: 'side-bar-header',
  imports: [CommonModule, AddCollectionModal, PortalModule],
  templateUrl: './side-bar-header.html',
  styleUrl: './side-bar-header.css',
})
export class SideBarHeader {
  
  readonly store = inject(Store);
  private actionsMenuService = inject(ActionMenuService);
  private overlay = inject(Overlay);
  private viewContainerRef = inject(ViewContainerRef);

  readonly HEADER_MENU_ID = '__header__';
  openedActionsCollectionId: string | null = null;
  isShowAddCollectionModalActive = false;

  public currentOpenedCollectionId$ = this.actionsMenuService.openedId$;

  addCollectionPortal = viewChild.required<CdkPortal>(CdkPortal);
  overlayRef: OverlayRef;

  collectionActionPortal = viewChild.required<TemplateRef<any>>('actions');

  toggleMenu(event: MouseEvent, trigger: HTMLElement) {
    event.stopPropagation();

    this.actionsMenuService.openedId$.pipe(take(1)).subscribe(current => {
      console.log(`Current: ${current}`);
        current === this.HEADER_MENU_ID ? this.actionsMenuService.close() : this.actionsMenuService.open(this.HEADER_MENU_ID, trigger, this.collectionActionPortal(), this.viewContainerRef, [
        {
          originX: 'end',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
          offsetX: 30,
          offsetY: 6,
        }
      ]);
    });
  }

  showAddCollectionModal() {
    console.log(`Show add collection modal`);
    this.actionsMenuService.close();

    this.overlayRef = this.buildOverlayRef(this.overlay);
    this.overlayRef.attach(this.addCollectionPortal());
  }

  openCollection(){
    console.log(`Open collection`);
    this.store.dispatch(openCollection());
  }

  addCollection(collectionInfo: AddCollectionDto){
    this.store.dispatch(addCollectionModal({actionData: { modalOverlayRefs: [this.overlayRef] , body: collectionInfo}}));
  }

  buildOverlayRef(overlay: Overlay) : OverlayRef{
     const overlayRef = overlay.create({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-dark-backdrop',
      positionStrategy: this.overlay.position()
        .global()
        .centerHorizontally(),
        usePopover: false
    })

    overlayRef.backdropClick().subscribe(() => {
      overlayRef?.detach();
    });

    return overlayRef;
  }


}
