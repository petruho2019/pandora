import { SideBarHeader } from './../side-bar-header/side-bar-header';
import { Component, EventEmitter, inject, Output, signal, ViewChild, WritableSignal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { PortalModule } from '@angular/cdk/portal';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { Store } from '@ngrx/store';
import { OverlayRef } from '@angular/cdk/overlay';
import { BlurService } from '../../../../../services/blur-service';
import { ActionMenuService } from '../../../../../services/actions-menu-service';
import { Observable, of } from 'rxjs';
import { Collection } from '../../../../../shared/models/collections/collection';
import { CloneCollectionDto } from '../../../../../shared/models/collections/dto/collection-action-dtos';
import { loadCollections, moveCollection } from '../../../store/actions/collections.actions';
import { loadRequests, moveRequest } from '../../../store/actions/requests.actions';
import { CreateRequestInfo } from '../../../../../shared/models/event-models/add-request-info';
import { RequestModel, RequestTypes } from '../../../../../shared/models/requests/request';
import { RenameDto } from '../../../../../shared/models/dto/shared-dtos';
import { selectRequestsByCollectionId } from '../../../store/selectors/requests.selector';
import { selectAll } from '../../../store/selectors/collections.selector';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import { CollectionItem } from '../collections/collection-item/collection-item';
import { RequestCollectionItem } from '../requests/request-item/request-item';
import { cloneCollectionModal, closeCollectionModal, renameCollectionModal } from '../../../store/actions/modal-actions/collections-modal.actions';
import { createHttpRequest } from '../../../store/actions/modal-actions/request-modal.actions';
import { buildDefaultAuth, buildDefaultBody } from '../../../../../shared/models/requests/http/http-request-model';
import { INITIAL_REQUESTS_STATE } from '../../../store/reducers/requests.reducer';

@Component({
  selector: 'side-bar-content',
  imports: [SideBarHeader, AsyncPipe, PortalModule, CollectionItem, CdkDropList, CdkDrag, RequestCollectionItem],
  templateUrl: './side-bar-content.html',
  styleUrl: './side-bar-content.css',
})
export class SideBarContent {
  private store = inject(Store);

  public blurService = inject(BlurService);
  private actionsMenuService = inject(ActionMenuService);

  @ViewChild(SideBarHeader) sideBarHeaderChild: SideBarHeader;
  @ViewChild(CollectionItem) collectionItem: CollectionItem;

  public renameCollectionHeader: string = "Переименовать коллекцию";

  public collections = toSignal(this.store.select(selectAll));
  public collections$ = toObservable(this.collections);

  public requests = signal<Record<string, { isLoaded: boolean; requests: RequestModel[] }>>({});
  public requests$: Observable<Record<string, { isLoaded: boolean; requests: RequestModel[] }>> = toObservable(this.requests);

  public emptyCollections: Record<string, boolean> = {};
  public openCollections: WritableSignal<Record<string, boolean>> = signal({});

  ngOnInit(): void {
    this.store.dispatch(loadCollections());

    this.openCollections.set((this.collections() as Collection[]).reduce((acc, c) => {
      acc[c.id] = false;
      return acc;
    }, {} as Record<string, boolean>));
  }

  handleCreateRequest(overlay: OverlayRef, request: CreateRequestInfo) {
    switch (request.type) {

      case RequestTypes.HTTP:
        console.log(`onCreateRequest addHttpRequest: ${JSON.stringify(request)} , collectionId ${this.actionsMenuService.currentId}`);
        this.store.dispatch(createHttpRequest({ actionData: { body: request, modalOverlayRefs: [overlay], successMessage: 'Запрос успешно добавлен' } }));
      break;

      // case 'gRPC':
      //   this.store.dispatch(addGrpcRequest({ request }));
      //   break;
    }
  }

  handleCloneCollection(overlay: OverlayRef, collectionInfo: CloneCollectionDto) {
    this.store.dispatch(cloneCollectionModal({ actionData: { modalOverlayRefs: [overlay], body: collectionInfo } }));
  }

  handleRenameCollection(overlay: OverlayRef, collectionInfo: RenameDto) {
    console.log(`handleRenameCollection ${JSON.stringify(collectionInfo)}`);
    this.store.dispatch(renameCollectionModal({ actionData: { modalOverlayRefs: [overlay], body: collectionInfo} }));
  }

  handleOpenCollection(collectionId: string, isOpen: boolean){
    this.openCollections.update(col => {
      col[collectionId] = isOpen;
      return col
    });

    const requestsByCollectionId = this.requests()[collectionId];

    if(requestsByCollectionId === undefined || !requestsByCollectionId.isLoaded){
      this.loadRequestsByCollectionId(collectionId, this.collections()?.find(c => c.id === collectionId)?.path as string)
      return;
    }
  }

  handleCloseCollection(overlay: OverlayRef, collectionId: string) {
    this.store.dispatch(closeCollectionModal({ actionData: { modalOverlayRefs: [overlay], body: {collectionId: collectionId}} }));
  }

  loadRequestsByCollectionId(collectionId: string, collectionPath: string){
    this.store.dispatch(loadRequests({collectionInfo: {collectionPath: collectionPath, collectionId: collectionId}}))

    this.store.select(selectRequestsByCollectionId({collectionId: collectionId}))
      .subscribe(reqs => {
        this.requests.update(reqState => ({
          ...reqState,
          [collectionId]: {
            isLoaded: true,
            requests: reqs
          }
        }));

        setTimeout((reqs: RequestModel[])=> {
          if(reqs.length === 0) {
            this.emptyCollections[collectionId] = true;
          }
          else {
            this.emptyCollections[collectionId] = false;
          }
        }, 200, reqs);
        
    });

    if (collectionId === 'dc378aa8-b42e-468a-bb5d-5dad6e0f9b7b') {
      this.requests.update(state => ({
        ...state,
        [collectionId]: { isLoaded: true, requests: Object.entries(INITIAL_REQUESTS_STATE.entities).filter(r => r[1]!.collectionId === collectionId).map(r => r[1] as RequestModel) }
      }));
    }

    if (collectionId === '33abfac2-d678-481c-aa9a-39ac8361bd3e') {
      this.requests.update(state => ({
        ...state,
        [collectionId]: { isLoaded: true, requests: Object.entries(INITIAL_REQUESTS_STATE.entities).filter(r => r[1]!.collectionId === collectionId).map(r => r[1] as RequestModel) }
      }))
    };
  }

  showAddRequestModal(coll: Collection) {
    this.collectionItem.showAddRequestModal(coll.id, coll.path);
  }

  showAddCollectionModalRef(){
    this.sideBarHeaderChild.showAddCollectionModal();
  }

  openCollectionRef() {
    this.sideBarHeaderChild.openCollection();
  }

  renameCollectionRef(collInfo: RenameDto) {
    this.collectionItem.showRenameCollectionModal(collInfo.id, collInfo.name);
  }

  openCollectionInFSRef(collId: string){
    this.collectionItem.showFolderCollection(collId);
  }

  closeCollectionRef(collInfo: {collectionId: string, collectionName: string, collectionPath: string}){
    this.collectionItem.showCloseCollectionModal(collInfo.collectionId, collInfo.collectionName, collInfo.collectionPath);
  }
  
  dropCollection($event: CdkDragDrop<string[]>){
    this.store.dispatch(moveCollection({fromIndex: $event.previousIndex, toIndex: $event.currentIndex}));
  }

  dropRequest($event: CdkDragDrop<string[]>){
    this.store.dispatch(moveRequest({fromIndex: $event.previousIndex, toIndex: $event.currentIndex}));
  }
}
