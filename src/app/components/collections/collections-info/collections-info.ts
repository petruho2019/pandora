import { Component, ElementRef, HostListener, inject, OnInit, TemplateRef, ViewChild, viewChild, ViewContainerRef } from '@angular/core';
import { CollectionsHeader } from "../collections-header/collections-header";
import { Store } from '@ngrx/store';
import { selectAll } from '../../../store/selectors/collections.selector';
import { CommonModule } from '@angular/common';
import { Observable, of, take } from 'rxjs';
import { ActionsMenuService } from '../../../../../services/actions-menu-service';
import { AddRequestModal } from "../../requests/modals/add-request-modal/add-request-modal";
import { createHttpRequest, createRequestFailure, loadRequests } from '../../../store/actions/requests.actions';
import { CreateRequestInfo } from '../../../../../shared/models/event-models/add-request-info'
import { RequestModel, RequestTypes } from '../../../../../shared/models/requests/request';
import { cloneCollection, loadCollections, moveCollection, openCollectionInFS, removeCollection, renameCollection } from '../../../store/actions/collections.actions';
import { ofType } from '@ngrx/effects';
import { RequestCollectionItem } from '../../requests/request-collection-item/request-collection-item';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { PortalModule, TemplatePortal } from '@angular/cdk/portal';
import { CloneCollectionModal } from "../modals/clone-collection-modal/clone-collection-modal";
import { CloneCollectionDto, RemoveCollectionInfo } from '../../../../../shared/models/collections/dto/collection-action-dtos';
import { RemoveCollectionModal } from '../modals/remove-collection-modal/remove-collection-modal';
import { BlurService } from '../../../../../services/blur-service';
import { RenameModal } from "../../reuseable/modals/rename-modal/rename-modal";
import { RenameDto } from "../../../../../shared/models/dto/shared-dtos";
import { selectRequestsByCollectionId } from '../../../store/selectors/requests.selector';
import { Collection } from '../../../../../shared/models/collections/collection';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';


@Component({
  selector: 'collections-info',
  imports: [CollectionsHeader, CommonModule, RequestCollectionItem, PortalModule, AddRequestModal, CloneCollectionModal, RemoveCollectionModal, RenameModal, CdkDropList, CdkDrag],
  templateUrl: './collections-info.html',
  styleUrl: './collections-info.css',
})
export class CollectionsInfo implements OnInit {
  private store = inject(Store);
  private overlay = inject(Overlay)
  private viewContainerRef = inject(ViewContainerRef);
  public blurService = inject(BlurService);
  private actionsMenuService = inject(ActionsMenuService);

  public renameCollectionHeader: string = "Переименовать коллекцию";

  //public readonly collections$ = this.store.select(selectAll);

  public collections$: Observable<Collection[]> | null = null; // Test

  public openCollections: Record<string, boolean> = {};
  
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

  ngOnInit(): void {
    console.log("ngOnInit");

    this.store.dispatch(loadCollections());

    this.store.pipe(
      ofType(createRequestFailure)
    ).subscribe(errorBody => {
      alert(errorBody.error.message);
    })

    this.collections$ = of([
      { id: 'dc378aa8-b42e-468a-bb5d-5dad6e0f9b7b', name: 'TEST 1 ajsdgajkshgdjkhagdkjgsajkdgjakgsdkjgasjdhg', path: 'D:\\1\\Developer\\silver\\Silver.Client\\collections_for_tests\\TEST 1' },
      { id: '33abfac2-d678-481c-aa9a-39ac8361bd3e', name: 'TEST 2', path: 'D:\\1\\Developer\\silver\\Silver.Client\\collections_for_tests\\TEST 2' }
    ]);

    this.collections$.pipe(take(1)).subscribe(collections => {
      this.openCollections = collections.reduce((acc, c) => {
        acc[c.id] = false;
        return acc;
      }, {} as Record<string, boolean>);
    });

  }

  toggleCollectionActions(event: MouseEvent, id: string) {
    console.log(`toggleCollectionActions collectionId: ${id}`);
    event.stopPropagation();
    this.actionsMenuService.openedId$.pipe(take(1)).subscribe(current => {
      console.log(`Current: ${current}`);
        current === id ? this.actionsMenuService.close() : this.actionsMenuService.open(id);
    });
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

  showCollectionFolder(collectionId: string){
    this.store.dispatch(openCollectionInFS({collectionId: collectionId}))
    this.actionsMenuService.close();
  }

  toggleCollectionWithCodition(event: MouseEvent, id: string) {

    console.log(`toggleCollectionActionsWithCodition collectionId: ${id}`);
    event.stopPropagation();

    if(!this.openCollections[id]){
      this.openCollections[id] = true;
    }

    this.blurService.clearBlur();
  }

  toggleCollection($event:MouseEvent, collectionId: string){

    $event.stopPropagation();

    this.openCollections[collectionId] = !this.openCollections[collectionId];

    this.closeActions();
  }

  handleCreateRequest(request: CreateRequestInfo) {

    console.log(`onCreateRequest логирование аргументов: ${JSON.stringify(request)}`);
    switch (request.type) {

      case RequestTypes.HTTP:
        console.log(`onCreateRequest addHttpRequest: ${JSON.stringify(request)} , collectionId ${this.actionsMenuService.currentId}`);
        this.store.dispatch(createHttpRequest({ requestInfo: request }));
      break;

      // case 'gRPC':
      //   this.store.dispatch(addGrpcRequest({ request }));
      //   break;
    }
  }

  handleCloneCollection(collectionInfo: CloneCollectionDto) {
    this.store.dispatch(cloneCollection({ collectionInfo }));
    this.cloneCollectionOverlayRef.dispose();
  }

  handleRenameCollection(collectionInfo: RenameDto) {
    console.log(`handleRenameCollection ${JSON.stringify(collectionInfo)}`);
    this.store.dispatch(renameCollection({ collectionInfo }));
    this.renameCollectionOverlayRef.dispose();
  }

  handleRemoveCollection(collectionId: string) {
    this.store.dispatch(removeCollection({ collectionId: collectionId }));
    this.removeCollectionOverlayRef.dispose();
  }

  isCollectionActionsOpen(collectionId: string){
    return this.openCollections[collectionId];
  }

  getRequestsByCollectionId(collectionId: string, collectionPath: string): Observable<RequestModel[]>{
    if (collectionId === 'dc378aa8-b42e-468a-bb5d-5dad6e0f9b7b'){
      return of([ { id: "085059cb-2e3e-4550-b364-aff15fe5c849", name:"asdasd", type: "HTTP", method: "GET", url: "asdasd" , headers: null , body: null, collectionId: collectionId, fileName: "asdasd"} as RequestModel, { id: "531ce6c4-a7ee-4f85-9015-2e776ab38db0", name:"фывфыв", type: "HTTP", method: "GET", url: "фывфыв" , headers: null , body: null, collectionId: collectionId , fileName: "фывфыв"} as RequestModel ]);
    }

    if (collectionId === '33abfac2-d678-481c-aa9a-39ac8361bd3e'){
      return of([ { id: "9058196d-801b-44df-9ef8-17f331c958c5", name:"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", type: "HTTP", method: "GET", url: "asdasd" , headers: null , body: null, collectionId: collectionId, fileName: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" } as RequestModel] );
    }

    this.store.dispatch(loadRequests({collectionInfo: {collectionPath: collectionPath, collectionId: collectionId}}))

    return this.store.select(selectRequestsByCollectionId({collectionId: collectionId}));
  }

  dropCollection($event: CdkDragDrop<string[]>){
    this.store.dispatch(moveCollection({fromIndex: $event.previousIndex, toIndex: $event.currentIndex}));
  }

  onRightClick($event: MouseEvent, collectionId: string) {
    this.toggleCollectionActions($event, collectionId);
  }

  @HostListener('document:click')
  closeActions() {
    console.log(`Close action menu`);
    this.actionsMenuService.close();
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

  onBlurItem(id: string){
    console.log(`Blur collection`);
    this.blurService.setCurrentBlurId(id as string);
  }

  test(){
    console.log(`s.dkfjghsljhkdf`);
  }
}
