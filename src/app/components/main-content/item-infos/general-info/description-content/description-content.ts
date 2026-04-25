import { RenameDto } from '../../../../../../../shared/models/dto/shared-dtos';
import { toSignal } from '@angular/core/rxjs-interop';
import { Component, computed, EventEmitter, inject, OnInit, Output, signal, TemplateRef, viewChild, ViewContainerRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectAll } from '../../../../../store/selectors/collections.selector';
import { of, take } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { Collection } from '../../../../../../../shared/models/collections/collection';
import { ActionMenuService } from '../../../../../../../services/actions-menu-service';
import { CloseCollectionInfo as CloseCollectionInfo, DeleteCollectionDto } from '../../../../../../../shared/models/collections/dto/collection-action-dtos';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { DeleteCollection } from "../modals/delete-collection/delete-collection-modal";
import { deleteCollectionModal } from '../../../../../store/actions/modal-actions/collections-modal.actions';
import { WorkspaceFacadeService } from '../../../../../../../services/workspace-facade-service';

@Component({
  selector: 'description-content',
  imports: [AsyncPipe, DeleteCollection],
  templateUrl: './description-content.html',
  styleUrl: './description-content.css',
})
export class DescriptionContent {

  private store = inject(Store);
  private actionMenuService = inject(ActionMenuService);
  private overlay = inject(Overlay);
  private viewContainerRef = inject(ViewContainerRef);
  private workspaceFacadeService = inject(WorkspaceFacadeService);

  public collections$ = this.store.select(selectAll);
  public collections = toSignal(this.collections$);
  
  public currentOpenedCollectionId$ = this.actionMenuService.openedId$;

  @Output() addCollection = new EventEmitter();
  @Output() openCollection = new EventEmitter();
  @Output() renameCollection = new EventEmitter();
  @Output() openCollectionInFS = new EventEmitter();
  @Output() closeCollection = new EventEmitter();


  deletePortal = viewChild.required<TemplateRef<any>>('delete');
  deleteOverlayRef: OverlayRef;
  deleteCollectionInfo: DeleteCollectionDto;

  collActionsPortal = viewChild.required<TemplateRef<any>>('collActions');
  actionsColl: Collection;

  public collectionsCount = computed(() => {
    return this.collections()?.length;
  })

  toggleCollectionActions(event: MouseEvent, coll: Collection, trigger: HTMLElement) {
    console.log(`toggleCollectionActions collectionId: ${coll.id}`);
    event.stopPropagation();
    this.actionMenuService.openedId$.pipe(take(1)).subscribe(current => {
      console.log(`Current: ${current}`);
        current === this.getCustomCollectionId(coll.id) ? this.actionMenuService.close() : this.actionMenuService.open(this.getCustomCollectionId(coll.id), trigger, this.collActionsPortal(), this.viewContainerRef, [
        {
          originX: 'end',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
          offsetX: 1,
          offsetY: -10
        }
      ]);
    });

    this.actionsColl = coll;
  }

  handleRenameCollection() {
    const renameDto: RenameDto = {
      id: this.actionsColl.id,
      name: this.actionsColl.name
    };
    this.renameCollection.emit(renameDto);
  }

  handleOpenInFS() {
    this.openCollectionInFS.emit(this.actionsColl.id);
  }
  
  handleCloseCollection() {
    const closeCollInfo: CloseCollectionInfo = {
      collectionId: this.actionsColl.id,
      collectionName: this.actionsColl.name,
      collectionPath: this.actionsColl.path
    }
    this.closeCollection.emit(closeCollInfo);
  }

  showDeleteCollection() {
    this.actionMenuService.close();

    this.deleteCollectionInfo = {
      collectionId: this.actionsColl.id,
      collectionName: this.actionsColl.name,
      collectionPath: this.actionsColl.path
    }

    this.deleteOverlayRef = this.buildOverlayRef(this.overlay);
    const portal = new TemplatePortal(this.deletePortal(), this.viewContainerRef);
    this.deleteOverlayRef.attach(portal);
  }

  handleDeleteCollection(collId: string) {
    this.store.dispatch(deleteCollectionModal({ actionData: { modalOverlayRef: this.deleteOverlayRef, body: collId  }}))
  }

  handleAddCollection(){
    this.addCollection.emit();
  }

  handleOpenCollection(){
    this.openCollection.emit();
  }

  setWorkspace(coll: Collection){
    this.workspaceFacadeService.openCollection(coll);
  }







  getCustomCollectionId(collId: string){
    return collId + '__description';
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
