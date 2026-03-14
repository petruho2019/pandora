import { Component, EventEmitter, inject, Input, Output, Signal, signal, TemplateRef, viewChild, ViewContainerRef, WritableSignal } from '@angular/core';
import { Collection } from '../../../../../shared/models/collections/collection';
import { ActionsMenuService } from '../../../../../services/actions-menu-service';
import { BlurService } from '../../../../../services/blur-service';
import { Store } from '@ngrx/store';
import { take } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { CloneCollectionDto, RemoveCollectionInfo } from '../../../../../shared/models/collections/dto/collection-action-dtos';
import { TemplatePortal } from '@angular/cdk/portal';
import { openCollectionInFS } from '../../../store/actions/collections.actions';
import { AddRequestModal } from "../../requests/modals/add-request-modal/add-request-modal";
import { CloneCollectionModal } from "../modals/clone-collection-modal/clone-collection-modal";
import { RenameModal } from "../../reuseable/modals/rename-modal/rename-modal";
import { RemoveCollectionModal } from "../modals/remove-collection-modal/remove-collection-modal";
import { CreateRequestInfo } from '../../../../../shared/models/event-models/add-request-info';
import { RenameDto } from '../../../../../shared/models/dto/shared-dtos';

@Component({
  selector: 'collection-item',
  imports: [CommonModule, AddRequestModal, CloneCollectionModal, RenameModal, RemoveCollectionModal],
  templateUrl: './collection-item.html',
  styleUrl: './collection-item.css',
})
export class CollectionItem {
  private store = inject(Store);
  public blurService = inject(BlurService);
  private actionsMenuService = inject(ActionsMenuService);
    private overlay = inject(Overlay)
  private viewContainerRef = inject(ViewContainerRef);

  public renameCollectionHeader: string = "Переименовать коллекцию";

  isOpen: boolean = false;

  @Input() collection: Collection;
  @Output() handleOpenCollection = new EventEmitter<{collectionId: string, isOpen: boolean} >();

  @Output() handleAddRequest = new EventEmitter<{overlay: OverlayRef, addRequestInfo: CreateRequestInfo}>();
  @Output() handleCloneCollection = new EventEmitter<{overlay: OverlayRef,cloneCollectionDto: CloneCollectionDto}>();
  @Output() handleRenameCollection = new EventEmitter<{overlay: OverlayRef, renameDto: RenameDto}>();
  @Output() handleRemoveCollection = new EventEmitter<{overlay: OverlayRef, collectionId: string}>();

  public currentOpenedCollectionId$ = this.actionsMenuService.openedId$;

  public currentBlurCollectionId: string;

  addRequestPortal = viewChild.required<TemplateRef<any>>('addRequest');
  addRequestOverlayRef: OverlayRef;
  addRequestCollectionId: string;
  addRequestCollectionPath: string;
  
  cloneCollectionPortal = viewChild.required<TemplateRef<any>>('cloneCollection');
  cloneCollectionOverlayRef: OverlayRef;
  cloneCollectionId: string;
  cloneCollectionName: string;

  renameCollectionPortal = viewChild.required<TemplateRef<any>>('renameCollection');
  renameCollectionOverlayRef: OverlayRef;
  renameCollectionId: string;
  renameCollectionName: string;
  renameCollectionPlacholder: string = "Введите новое название коллекции";

  removeCollectionPortal = viewChild.required<TemplateRef<any>>('closeCollection');
  removeCollectionOverlayRef: OverlayRef;
  removeCollectionInfo: RemoveCollectionInfo;


  toggleCollectionActions(event: MouseEvent, id: string) {
    console.log(`toggleCollectionActions collectionId: ${id}`);
    event.stopPropagation();
    this.actionsMenuService.openedId$.pipe(take(1)).subscribe(current => {
      console.log(`Current: ${current}`);
        current === id ? this.actionsMenuService.close() : this.actionsMenuService.open(id);
    });
  }


  openCollectionIfNotOpen(event: MouseEvent, id: string) {
    console.log(`openCollectionIfNotOpen collectionId: ${id}`);
    event.stopPropagation();

    if(!this.isOpen){
      this.handleOpenCollection.emit({collectionId: id, isOpen: true});
      this.isOpen = true;
    }

    this.blurService.clearBlur();
  }

  openCollection($event:MouseEvent){
    $event.stopPropagation();

    this.isOpen = !this.isOpen;
    this.handleOpenCollection.emit({collectionId: this.collection.id, isOpen: this.isOpen});

    this.actionsMenuService.close();
  }

  showAddRequestModal(collectionId: string, collectionPath: string) {
    this.addRequestCollectionId = collectionId;
    this.addRequestCollectionPath = collectionPath;
    this.actionsMenuService.close();

    this.addRequestOverlayRef = this.buildOverlayRef(this.overlay);

    this.addRequestOverlayRef.backdropClick().subscribe(() => {
      this.addRequestOverlayRef?.dispose();
    });

    const portal = new TemplatePortal(this.addRequestPortal(), this.viewContainerRef);

    this.addRequestOverlayRef.attach(portal);
  }

  showCloneCollectionModal(collectionId: string, collectionName: string){
    this.cloneCollectionId = collectionId;
    this.cloneCollectionName = collectionName;

    this.actionsMenuService.close();

    this.cloneCollectionOverlayRef = this.buildOverlayRef(this.overlay);

    this.cloneCollectionOverlayRef.backdropClick().subscribe(() => {
      this.cloneCollectionOverlayRef?.dispose();
    });

    const portal = new TemplatePortal(this.cloneCollectionPortal(), this.viewContainerRef);

    this.cloneCollectionOverlayRef.attach(portal);
  }

  showRenameCollectionModal(collectionId: string, collectionName: string){
    this.renameCollectionId = collectionId;
    this.renameCollectionName = collectionName;

    this.actionsMenuService.close();

    this.renameCollectionOverlayRef = this.buildOverlayRef(this.overlay);

    this.renameCollectionOverlayRef.backdropClick().subscribe(() => {
      this.renameCollectionOverlayRef?.dispose();
    });

    const portal = new TemplatePortal(this.renameCollectionPortal(), this.viewContainerRef);

    this.renameCollectionOverlayRef.attach(portal);
  }

  showCloseCollectionModal(collectionId: string, collectionName: string, collectionPath: string) {

    this.removeCollectionInfo = {
      collectionId: collectionId,
      collectionName: collectionName,
      collectionPath: collectionPath
    }

    this.actionsMenuService.close();

    this.removeCollectionOverlayRef = this.buildOverlayRef(this.overlay);

    this.removeCollectionOverlayRef.backdropClick().subscribe(() => {
      this.removeCollectionOverlayRef?.dispose();
    });

    const portal = new TemplatePortal(this.removeCollectionPortal(), this.viewContainerRef);

    this.removeCollectionOverlayRef.attach(portal);
  }

  showFolderCollection(collectionId: string){
    this.store.dispatch(openCollectionInFS({collectionId: collectionId}))
    this.actionsMenuService.close();
  }


  addRequest(request: CreateRequestInfo) {
    this.handleAddRequest.emit({overlay: this.addRequestOverlayRef, addRequestInfo: request});
    
  }

  cloneCollection(collectionInfo: CloneCollectionDto) {
    this.handleCloneCollection.emit({overlay: this.cloneCollectionOverlayRef, cloneCollectionDto: collectionInfo});
  }

  renameCollection(collectionInfo: RenameDto) {
    this.handleRenameCollection.emit({overlay: this.renameCollectionOverlayRef, renameDto: collectionInfo});
  }

  removeCollection(collectionId: string) {
    this.handleRemoveCollection.emit({overlay: this.removeCollectionOverlayRef, collectionId: collectionId});
  }



  onRightClick($event: MouseEvent, collectionId: string) {
    this.toggleCollectionActions($event, collectionId);
  }

  onBlurItem(id: string){
    console.log(`Blur collection`);
    this.blurService.setCurrentBlurId(id as string);
  }

  buildOverlayRef(overlay: Overlay){
    return overlay.create({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-dark-backdrop',
      positionStrategy: this.overlay.position()
        .global()
        .centerHorizontally()
    });
  }

}
