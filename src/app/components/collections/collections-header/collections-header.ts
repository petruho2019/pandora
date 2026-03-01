import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { AddCollectionModal } from "../modals/add-collection-modal/add-collection-modal";
import { ActionsMenuService } from '../../../services/actions-menu-service';
import { ElectronService } from '../../../services/electron-service';
import { Store } from '@ngrx/store';
import { addCollection, openCollection } from '../../../store/actions/collections.actions';
import { take } from 'rxjs';

@Component({
  selector: 'collections-header',
  imports: [CommonModule, AddCollectionModal],
  templateUrl: './collections-header.html',
  styleUrl: './collections-header.css',
})
export class CollectionsHeader {

  readonly store = inject(Store);
  private actionsMenuService = inject(ActionsMenuService);

  readonly HEADER_MENU_ID = '__header__';
  openedActionsCollectionId: string | null = null;
  isShowAddCollectionModalActive = false;

  public currentOpenedCollectionId$ = this.actionsMenuService.openedId$;

  toggleMenu(event: MouseEvent) {
    event.stopPropagation();

    this.actionsMenuService.openedId$.pipe(take(1)).subscribe(current => {
      console.log(`Current: ${current}`);
        current === this.HEADER_MENU_ID ? this.actionsMenuService.close() : this.actionsMenuService.open(this.HEADER_MENU_ID);
    });
  }

  showAddCollectionModal() {
    console.log(`Show add collection modal`);
    this.isShowAddCollectionModalActive = true;
    this.actionsMenuService.close();
  }

  openCollection(){
    console.log(`Open collection`);
    this.store.dispatch(openCollection());
  }

  addCollection(collectionInfo: { name: string, path: string }){
    this.store.dispatch(addCollection(collectionInfo));
  }

  closeModal() {
    this.isShowAddCollectionModalActive = false;
  }
}
