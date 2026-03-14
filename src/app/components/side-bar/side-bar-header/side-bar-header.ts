import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { Component, inject, viewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { ActionsMenuService } from '../../../../../services/actions-menu-service';
import { CdkPortal, PortalModule } from '@angular/cdk/portal';
import { take } from 'rxjs';
import { addCollection, openCollection } from '../../../store/actions/collections.actions';
import { CommonModule } from '@angular/common';
import { AddCollectionModal } from '../../collections/modals/add-collection-modal/add-collection-modal';

@Component({
  selector: 'side-bar-header',
  imports: [CommonModule, AddCollectionModal, PortalModule],
  templateUrl: './side-bar-header.html',
  styleUrl: './side-bar-header.css',
})
export class SideBarHeader {
  
  readonly store = inject(Store);
  private overlay = inject(Overlay)
  private actionsMenuService = inject(ActionsMenuService);

  readonly HEADER_MENU_ID = '__header__';
  openedActionsCollectionId: string | null = null;
  isShowAddCollectionModalActive = false;

  public currentOpenedCollectionId$ = this.actionsMenuService.openedId$;

  portal = viewChild.required<CdkPortal>(CdkPortal);
  overlayRef: OverlayRef;

  toggleMenu(event: MouseEvent) {
    event.stopPropagation();

    this.actionsMenuService.openedId$.pipe(take(1)).subscribe(current => {
      console.log(`Current: ${current}`);
        current === this.HEADER_MENU_ID ? this.actionsMenuService.close() : this.actionsMenuService.open(this.HEADER_MENU_ID);
    });
  }

  showAddCollectionModal() {
    console.log(`Show add collection modal`);
    this.actionsMenuService.close();

    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-dark-backdrop',
      positionStrategy: this.overlay.position()
        .global()
        .centerHorizontally()
    });

    this.overlayRef.backdropClick().subscribe(() => {
      this.overlayRef?.dispose();
    });

    this.overlayRef.attach(this.portal());

  }

  openCollection(){
    console.log(`Open collection`);
    this.store.dispatch(openCollection());
  }

  addCollection(collectionInfo: { name: string, path: string }){
    this.store.dispatch(addCollection(collectionInfo));
  }


}
