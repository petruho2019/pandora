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

  public collectionsCount = computed(() => {
    return this.collections()?.length;
  })

  toggleCollectionActions(event: MouseEvent, id: string) {
    console.log(`toggleCollectionActions collectionId: ${id}`);
    event.stopPropagation();
    // this.actionMenuService.openedId$.pipe(take(1)).subscribe(current => {
    //   console.log(`Current: ${current}`);
    //     current === this.getCustomCollectionId(id) ? this.actionMenuService.close() : this.actionMenuService.open(this.getCustomCollectionId(id));
    // });
  }

  handleRenameCollection(collId: string, collName: string) {
    const renameDto: RenameDto = {
      id: collId,
      name: collName
    };
    this.renameCollection.emit(renameDto);
  }

  handleOpenInFS(collId: string) {
    this.openCollectionInFS.emit(collId);
  }
  
  handleCloseCollection(collId: string, collName: string, collPath: string) {
    const closeCollInfo: CloseCollectionInfo = {
      collectionId: collId,
      collectionName: collName,
      collectionPath: collPath
    }
    this.closeCollection.emit(closeCollInfo);
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

  showDeleteCollection(coll: Collection) {
    this.actionMenuService.close();

    this.deleteCollectionInfo = {
      collectionId: coll.id,
      collectionName: coll.name,
      collectionPath: coll.path
    }

    this.deleteOverlayRef = this.buildOverlayRef(this.overlay);
    const portal = new TemplatePortal(this.deletePortal(), this.viewContainerRef);
    this.deleteOverlayRef.attach(portal);
  }

  handleDeleteCollection(collId: string) {
    this.store.dispatch(deleteCollectionModal({ actionData: { modalOverlayRef: this.deleteOverlayRef, body: collId  }}))
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
