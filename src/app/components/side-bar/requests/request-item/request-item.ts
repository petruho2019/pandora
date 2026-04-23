import { Component, inject, Input, OnInit, TemplateRef, viewChild, ViewContainerRef } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { take } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { CloneRequestModal } from '../modals/clone-request-modal/clone-request-modal';
import { AsyncPipe, NgClass } from '@angular/common';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { RenameModal } from '../../../reuseable/modals/rename-modal/rename-modal';
import { BlurService } from '../../../../../../services/blur-service';
import { ActionMenuService } from '../../../../../../services/actions-menu-service';
import { RequestModel, RequestTypes } from '../../../../../../shared/models/requests/request';
import { Collection } from '../../../../../../shared/models/collections/collection';
import { openRequestInFS } from '../../../../store/actions/requests.actions';
import { RenameDto } from '../../../../../../shared/models/dto/shared-dtos';
import { CloneRequestDto, DeleteRequestDto, RenameRequestDto } from '../../../../../../shared/models/requests/dto/request-dtos';
import { cloneRequest, deleteRequest, renameRequest } from '../../../../store/actions/modal-actions/request-modal.actions';
import { DeleteRequestModal } from "../modals/delete-request-modal/delete-request-modal";
import { TabItemService } from '../../../../../../services/tab-item-service';
import { WorkspaceFacadeService } from '../../../../../../services/workspace-facade-service';

@Component({
  selector: 'request-item',
  imports: [NgClass, AsyncPipe, FormsModule, CloneRequestModal, RenameModal, CdkDrag, CdkDragHandle, DeleteRequestModal],
  templateUrl: './request-item.html',
  styleUrl: './request-item.css',
})
export class RequestCollectionItem implements OnInit {

  public blurService = inject(BlurService);
  private actionsMenuService = inject(ActionMenuService)
  private overlay = inject(Overlay)
  private viewContainerRef = inject(ViewContainerRef);
  private store = inject(Store);
  private tabItemService = inject(TabItemService);
  private workspaceFacadeService = inject(WorkspaceFacadeService);

  renameHeader: string = "Переименовать запрос";

  public currentOpenRequestId$ = this.actionsMenuService.openedId$;

  @Input() request!: RequestModel;
  @Input() collection!: Collection;

  renamePortal = viewChild.required<TemplateRef<any>>('rename');
  renameOverlayRef: OverlayRef;

  clonePortal = viewChild.required<TemplateRef<any>>('clone');
  cloneOverlayRef: OverlayRef;

  deletePortal = viewChild.required<TemplateRef<any>>('delete');
  deleteOverlayRef: OverlayRef;

  actionsPortal = viewChild.required<TemplateRef<any>>('actions');

  canBeEdit: boolean = false;
  newRequestFolderName: string;
  renameRequestNamePlacholder: string = "Введите новое название запроса";

  ngOnInit(): void {
    this.newRequestFolderName = this.request.name;
  }

  isHttp(): boolean{
    return this.request.type === RequestTypes.HTTP;
  }

  onBlurRequest(){
    console.log(`Blur request id: ${this.request.id}`);
    this.blurService.setCurrentBlurId(this.request.id);
  }

  toggleActions($event: MouseEvent, trigger: HTMLElement){
    console.log(`toggleActions reqId: ${this.request.id}`);
    $event.stopPropagation();
    this.actionsMenuService.openedId$.pipe(take(1)).subscribe(current => {
      console.log(`Current: ${current}`);
        current === this.request.id ? this.actionsMenuService.close() : this.actionsMenuService.open(this.request.id, trigger, this.actionsPortal(), this.viewContainerRef, [
        {
          originX: 'end',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
          offsetX: 8,
          offsetY: 4
        }
      ]);
    });
  }

  addRequestTabItem(){
    console.log(`Id запроса из компонента ${this.request.id}`);

    this.workspaceFacadeService.addTabItem(this.request, this.collection);
  }

  setRequestTabItemIsNotReplaceable(){
    this.tabItemService.setRequestTabItemNotReplaceable(this.request, this.collection);
  }

  showRenameModal(){
    this.actionsMenuService.close();

    this.renameOverlayRef = this.buildOverlayRef(this.overlay);
    const portal = new TemplatePortal(this.renamePortal(), this.viewContainerRef);
    this.renameOverlayRef.attach(portal);
  }

  showCloneModal(){
    this.actionsMenuService.close();

    this.cloneOverlayRef = this.buildOverlayRef(this.overlay);
    const portal = new TemplatePortal(this.clonePortal(), this.viewContainerRef);
    this.cloneOverlayRef.attach(portal);
  }

  showRequestInFS() {
    this.store.dispatch(openRequestInFS({requestInfo: {requestId: this.request.id, collectionPath: this.collection.path}}));
    this.actionsMenuService.close();
  }

  showDeleteRequest() {
    this.actionsMenuService.close();

    this.deleteOverlayRef = this.buildOverlayRef(this.overlay);
    const portal = new TemplatePortal(this.deletePortal(), this.viewContainerRef);
    this.deleteOverlayRef.attach(portal);
  }

  handleRename(requestInfoFromModal: RenameDto){
    //this.newRequestFolderName = this.request.name;

    const requestInfo: RenameRequestDto = {
      requestId: requestInfoFromModal.id,
      newName: requestInfoFromModal.name,
      collectionPath: this.collection.path,
      oldFileName: this.request.name,
      newFileName: this.newRequestFolderName
    } 

    this.store.dispatch(renameRequest({actionData: { body: requestInfo, modalOverlayRef: this.renameOverlayRef }}));
  }

  handleClone(requestInfo: CloneRequestDto){
    requestInfo.requestId = this.request.id;
    requestInfo.collectionPath = this.collection.path;

    this.store.dispatch(cloneRequest({ actionData: { body: requestInfo , modalOverlayRef: this.cloneOverlayRef }  }));
  }

  handleDelete(requestId: string){
    console.log(`Удаление запроса ${requestId}`);

    const requestInfo : DeleteRequestDto = {
      requestId: requestId,
      collectionPath: this.collection.path
    };

    this.store.dispatch(deleteRequest({ actionData: { modalOverlayRef: this.deleteOverlayRef, body: requestInfo } }))
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

  changeFolderNameEditMode(){
    this.canBeEdit = !this.canBeEdit;
  }

  onRightClick($event: MouseEvent, trigger: HTMLElement) {
    this.toggleActions($event, trigger);
  }

}
