import { Component, EventEmitter, inject, Input, OnInit, Output, TemplateRef, viewChild, ViewContainerRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { take } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { AddRequestModal } from "../../requests/modals/add-request-modal/add-request-modal";
import { CloneCollectionModal } from "../modals/clone-collection-modal/clone-collection-modal";
import { RemoveCollectionModal } from "../modals/remove-collection-modal/remove-collection-modal";
import { RenameModal } from '../../../reuseable/modals/rename-modal/rename-modal';
import { BlurService } from '../../../../../../services/blur-service';
import { ActionsMenuService } from '../../../../../../services/actions-menu-service';
import { Collection } from '../../../../../../shared/models/collections/collection';
import { CreateRequestInfo } from '../../../../../../shared/models/event-models/add-request-info';
import { CloneCollectionDto, RemoveCollectionInfo } from '../../../../../../shared/models/collections/dto/collection-action-dtos';
import { RenameDto } from '../../../../../../shared/models/dto/shared-dtos';
import { openCollectionInFS } from '../../../../store/actions/collections.actions';
import { WorkspaceInfoService } from '../../../../../../services/workspace-info-service';
import { TabItemService } from '../../../../../../services/tab-item-service';
import { WorkspaceFacadeService } from '../../../../../../services/workspace-facade-service';


@Component({
  selector: 'collection-item',
  imports: [CommonModule, AddRequestModal, CloneCollectionModal, RenameModal, RemoveCollectionModal],
  templateUrl: './collection-item.html',
  styleUrl: './collection-item.css',
  standalone: true
})
export class CollectionItem {

  private store = inject(Store);
  public blurService = inject(BlurService);
  private actionsMenuService = inject(ActionsMenuService);
  private overlay = inject(Overlay)
  private viewContainerRef = inject(ViewContainerRef);
  private workspaceFacadeService = inject(WorkspaceFacadeService);

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
    this.stopPropagation(event);
    this.actionsMenuService.openedId$.pipe(take(1)).subscribe(current => {
      console.log(`Current: ${current}`);
        current === id ? this.actionsMenuService.close() : this.actionsMenuService.open(id);
    });
  }


  openCollectionIfNotOpen(event: MouseEvent, id: string) {

    this.stopPropagation(event);

    if(!this.isOpen){
      this.handleOpenCollection.emit({collectionId: id, isOpen: true});
      this.isOpen = true;
    }

    this.blurService.clearBlur();
  }

  setCollectionWorkspace(event: MouseEvent) {
    this.stopPropagation(event);
    console.log(`setCollectionWorkspace из компонента`);

    this.workspaceFacadeService.openCollection(this.collection);
  }

  openCollection(event:MouseEvent){
    this.stopPropagation(event);

    this.isOpen = !this.isOpen;
    this.handleOpenCollection.emit({collectionId: this.collection.id, isOpen: this.isOpen});

    this.actionsMenuService.close();
  }

  showAddRequestModal(collectionId: string, collectionPath: string) {
    this.addRequestCollectionId = collectionId;
    this.addRequestCollectionPath = collectionPath;
    
    this.actionsMenuService.close();

    this.addRequestOverlayRef = this.buildOverlayRef(this.overlay);
    const portal = new TemplatePortal(this.addRequestPortal(), this.viewContainerRef);
    this.addRequestOverlayRef.attach(portal);
  }

  showCloneCollectionModal(collectionId: string, collectionName: string){
    this.cloneCollectionId = collectionId;
    this.cloneCollectionName = collectionName;

    this.actionsMenuService.close();

    this.cloneCollectionOverlayRef = this.buildOverlayRef(this.overlay);
    const portal = new TemplatePortal(this.cloneCollectionPortal(), this.viewContainerRef);
    this.cloneCollectionOverlayRef.attach(portal);
  }

  showRenameCollectionModal(collectionId: string, collectionName: string){
    this.renameCollectionId = collectionId;
    this.renameCollectionName = collectionName;

    this.actionsMenuService.close();

    this.renameCollectionOverlayRef = this.buildOverlayRef(this.overlay);
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
    const portal = new TemplatePortal(this.removeCollectionPortal(), this.viewContainerRef);
    this.removeCollectionOverlayRef.attach(portal);
  }

  showFolderCollection(collectionId: string){
    this.store.dispatch(openCollectionInFS({collectionId: collectionId}));
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

  stopPropagation(event: MouseEvent){
    event.stopPropagation();
  }

}
