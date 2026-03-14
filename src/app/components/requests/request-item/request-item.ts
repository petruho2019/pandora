import { Component, inject, Input, OnInit, TemplateRef, viewChild, ViewContainerRef } from '@angular/core';
import { RequestModel, RequestTypes } from '../../../../../shared/models/requests/request';
import { CollectionEntity } from '../../../../../shared/models/entitys/collection-entity';
import { BlurService } from '../../../../../services/blur-service';
import { ActionsMenuService } from '../../../../../services/actions-menu-service';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { RenameDto } from '../../../../../shared/models/dto/shared-dtos';
import { take } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CloneRequestDto, RenameRequestDto } from '../../../../../shared/models/requests/dto/request-dtos';
import { Store } from '@ngrx/store';
import { renameRequest } from '../../../store/actions/requests.actions';
import { CloneRequestModal } from '../modals/clone-request-modal/clone-request-modal';
import { RenameModal } from "../../reuseable/modals/rename-modal/rename-modal";
import { AsyncPipe, NgClass } from '@angular/common';

@Component({
  selector: 'request-item',
  imports: [NgClass, AsyncPipe, FormsModule, CloneRequestModal, RenameModal],
  templateUrl: './request-item.html',
  styleUrl: './request-item.css',
})
export class RequestCollectionItem implements OnInit {
  
  public blurService = inject(BlurService);
  private actionsMenuService = inject(ActionsMenuService)
  private overlay = inject(Overlay)
  private viewContainerRef = inject(ViewContainerRef);
  private store = inject(Store);

  renameHeader: string = "Переименовать запрос";

  public currentOpenRequestId$ = this.actionsMenuService.openedId$;

  @Input() request!: RequestModel;
  @Input() collection!: CollectionEntity;

  renamePortal = viewChild.required<TemplateRef<any>>('rename');
  renameOverlayRef: OverlayRef;

  clonePortal = viewChild.required<TemplateRef<any>>('clone');
  cloneOverlayRef: OverlayRef;

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

  toggleActions($event: MouseEvent){
    console.log(`toggleActions reqId: ${this.request.id}`);
    $event.stopPropagation();
    this.actionsMenuService.openedId$.pipe(take(1)).subscribe(current => {
      console.log(`Current: ${current}`);
        current === this.request.id ? this.actionsMenuService.close() : this.actionsMenuService.open(this.request.id);
    });
  }


  showRenameModal(){
    this.actionsMenuService.close();

    this.renameOverlayRef = this.buildOverlayRef(this.overlay);

    this.renameOverlayRef.backdropClick().subscribe(() => {
      this.renameOverlayRef?.dispose();
    });

    const portal = new TemplatePortal(this.renamePortal(), this.viewContainerRef);

    this.renameOverlayRef.attach(portal);
  }

  showCloneModal(){
    this.actionsMenuService.close();

    this.cloneOverlayRef = this.buildOverlayRef(this.overlay);

    this.cloneOverlayRef.backdropClick().subscribe(() => {
      this.cloneOverlayRef?.dispose();
    });

    const portal = new TemplatePortal(this.clonePortal(), this.viewContainerRef);

    this.cloneOverlayRef.attach(portal);
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

    this.store.dispatch(renameRequest({requestInfo: requestInfo}));
  }

  handleClone(requestInfo: CloneRequestDto){

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

  changeFolderNameEditMode(){
    this.canBeEdit = !this.canBeEdit;
  }

  closeModal(){
    this.renameOverlayRef.dispose();
  }

}
