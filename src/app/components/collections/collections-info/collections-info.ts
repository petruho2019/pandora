import { Component, ElementRef, HostListener, inject, OnInit, TemplateRef, ViewChild, viewChild, ViewContainerRef } from '@angular/core';
import { CollectionsHeader } from "../collections-header/collections-header";
import { Store } from '@ngrx/store';
import { selectAll } from '../../../store/selectors/collections.selector';
import { CommonModule } from '@angular/common';
import { Observable, of, take } from 'rxjs';
import { ActionsMenuService } from '../../../services/actions-menu-service';
import { AddRequestModal } from "../../requests/modals/add-request-modal/add-request-modal";
import { createHttpRequest, createRequestFailure } from '../../../store/actions/requests.actions';
import { CollectionEntity } from '../../../../../shared/models/entitys/collection-entity'
import { CreateRequestInfo } from '../../../../../shared/models/event-models/add-request-info'
import { RequestModel, RequestTypes } from '../../../../../shared/models/requests/request';
import { cloneCollection, closeCollection, loadCollections, renameCollection } from '../../../store/actions/collections.actions';
import { ofType } from '@ngrx/effects';
import { RequestCollectionItem } from '../../requests/request-collection-item/request-collection-item';
import { Collection } from '../../../../../shared/models/collections/collection';
import { getRequestsByCollectionId } from '../../../store/selectors/requests.selector';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { PortalModule, TemplatePortal } from '@angular/cdk/portal';
import { CloneCollectionModal } from "../modals/clone-collection-modal/clone-collection-modal";
import { CloneCollectionDto, RenameCollectionDto } from '../../../../../shared/models/collections/dto/collection-action-dtos';
import { RenameCollectionModal } from "../modals/rename-collection-modal/rename-collection-modal";

@Component({
  selector: 'collections-info',
  imports: [CollectionsHeader, CommonModule, RequestCollectionItem, PortalModule, AddRequestModal, CloneCollectionModal, RenameCollectionModal],
  templateUrl: './collections-info.html',
  styleUrl: './collections-info.css',
})
export class CollectionsInfo implements OnInit {
  private store = inject(Store);
  private overlay = inject(Overlay)
  private viewContainerRef = inject(ViewContainerRef);

  public readonly collections$ = this.store.select(selectAll);

  //public collections$: Observable<Collection[]> | null = null; // Test

  public openCollections: Record<string, boolean> = {};
  
  private actionsMenuService = inject(ActionsMenuService);
  public currentOpenedCollectionId$ = this.actionsMenuService.openedId$;

  addRequestPortal = viewChild.required<TemplateRef<any>>('addRequest');
  addRequestOverlayRef: OverlayRef;
  
  cloneCollectionPortal = viewChild.required<TemplateRef<any>>('cloneCollection');
  cloneCollectionOverlayRef: OverlayRef;

  renameCollectionPortal = viewChild.required<TemplateRef<any>>('renameCollection');
  renameCollectionOverlayRef: OverlayRef;

  ngOnInit(): void {
    console.log("ngOnInit");

    this.store.dispatch(loadCollections());

    this.store.pipe(
      ofType(createRequestFailure)
    ).subscribe(errorBody => {
      alert(errorBody.error.message);
    })

    // this.collections$ = of([
    //   { id: 'dc378aa8-b42e-468a-bb5d-5dad6e0f9b7b', name: 'TEST 1 ajsdgajkshgdjkhagdkjgsajkdgjakgsdkjgasjdhg', path: 'D:\\1\\Developer\\silver\\Silver.Client\\collections_for_tests\\TEST 1' },
    //   { id: '33abfac2-d678-481c-aa9a-39ac8361bd3e', name: 'TEST 2', path: 'D:\\1\\Developer\\silver\\Silver.Client\\collections_for_tests\\TEST 2' }
    // ]);

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

  showAddRequestModal() {
    this.actionsMenuService.close();

    this.addRequestOverlayRef = this.buildOverlayRef(this.overlay);

    this.addRequestOverlayRef.backdropClick().subscribe(() => {
      this.addRequestOverlayRef?.dispose();
    });

    const portal = new TemplatePortal(this.addRequestPortal(), this.viewContainerRef);

    this.addRequestOverlayRef.attach(portal);
  }

  showCloneCollectionModal(){
    this.actionsMenuService.close();

    this.cloneCollectionOverlayRef = this.buildOverlayRef(this.overlay);

    this.cloneCollectionOverlayRef.backdropClick().subscribe(() => {
      this.cloneCollectionOverlayRef?.dispose();
    });

    const portal = new TemplatePortal(this.cloneCollectionPortal(), this.viewContainerRef);

    this.cloneCollectionOverlayRef.attach(portal);
  }

  showRenameCollectionModal(){
    this.actionsMenuService.close();

    this.renameCollectionOverlayRef = this.buildOverlayRef(this.overlay);

    this.renameCollectionOverlayRef.backdropClick().subscribe(() => {
      this.renameCollectionOverlayRef?.dispose();
    });

    const portal = new TemplatePortal(this.renameCollectionPortal(), this.viewContainerRef);

    this.renameCollectionOverlayRef.attach(portal);
  }

  // closeCollection(collection: Collection) {
  //   this.actionsMenuService.close();
  //   console.log(`close collection, ${collection.id}`);

  //   this.store.dispatch(closeCollection({collectionId: collection.id}));
  // }

  // deleteCollection() {
  //   this.actionsMenuService.close();
  //   console.log('delete collection');
  // }

  toggleCollection(collectionId: string){
    this.openCollections[collectionId] = !this.openCollections[collectionId];
  }

  handleCreateRequest(request: CreateRequestInfo) {

    console.log(`onCreateRequest логирование аргументов: ${JSON.stringify(request)}`);
    switch (request.type) {

      case RequestTypes.HTTP:
        console.log(`onCreateRequest addHttpRequest: ${JSON.stringify(request)} , collectionId ${this.actionsMenuService.currentId}`);
        this.store.dispatch(createHttpRequest({ collectionPath: request.collectionName, collectionId: this.actionsMenuService.currentId!, requestInfo: request }));
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

  handleRenameCollection(collectionInfo: RenameCollectionDto) {
    this.store.dispatch(renameCollection({ collectionInfo }));
    this.cloneCollectionOverlayRef.dispose();
  }

  isCollectionActionsOpen(collectionId: string){
    return this.openCollections[collectionId];
  }

  getRequestsByCollectionId(collectionId: string): Observable<RequestModel[]>{
    if (collectionId === 'dc378aa8-b42e-468a-bb5d-5dad6e0f9b7b'){
      return of([ { id: "085059cb-2e3e-4550-b364-aff15fe5c849", name:"asdasd", type: "HTTP", method: "GET", url: "asdasd" , headers: null , body: null, collectionId: collectionId}, { id: "531ce6c4-a7ee-4f85-9015-2e776ab38db0", name:"фывфыв", type: "HTTP", method: "GET", url: "фывфыв" , headers: null , body: null, collectionId: collectionId} ]);
    }

    if (collectionId === '33abfac2-d678-481c-aa9a-39ac8361bd3e'){
      return of([ { id: "9058196d-801b-44df-9ef8-17f331c958c5", name:"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", type: "HTTP", method: "GET", url: "asdasd" , headers: null , body: null, collectionId: collectionId }] );
    }

    // TODO Добавить Record для запросов коллекции которых открывались

    return this.store.select(getRequestsByCollectionId(collectionId));
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
}
