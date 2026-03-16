import { Component, computed, HostListener, inject, Signal, signal, TemplateRef, viewChild, ViewContainerRef, WritableSignal } from '@angular/core';
import { SideBarHeader } from "../side-bar-header/side-bar-header";
import { AsyncPipe, CommonModule } from '@angular/common';
import { RequestCollectionItem } from '../../requests/request-item/request-item';
import { PortalModule, TemplatePortal } from '@angular/cdk/portal';
import { AddRequestModal } from '../../requests/modals/add-request-modal/add-request-modal';
import { CloneCollectionModal } from '../../collections/modals/clone-collection-modal/clone-collection-modal';
import { RemoveCollectionModal } from '../../collections/modals/remove-collection-modal/remove-collection-modal';
import { RenameModal } from '../../reuseable/modals/rename-modal/rename-modal';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { Store } from '@ngrx/store';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { BlurService } from '../../../../../services/blur-service';
import { ActionsMenuService } from '../../../../../services/actions-menu-service';
import { map, Observable, of, take } from 'rxjs';
import { Collection } from '../../../../../shared/models/collections/collection';
import { CloneCollectionDto, RemoveCollectionInfo } from '../../../../../shared/models/collections/dto/collection-action-dtos';
import { cloneCollection, loadCollections, moveCollection, openCollectionInFS, removeCollection, renameCollection } from '../../../store/actions/collections.actions';
import { ofType } from '@ngrx/effects';
import { createHttpRequest, createRequestFailure, loadRequests, moveRequest } from '../../../store/actions/requests.actions';
import { CreateRequestInfo } from '../../../../../shared/models/event-models/add-request-info';
import { RequestModel, RequestTypes } from '../../../../../shared/models/requests/request';
import { RenameDto } from '../../../../../shared/models/dto/shared-dtos';
import { selectRequestError, selectRequestsByCollectionId } from '../../../store/selectors/requests.selector';
import { CollectionItem } from "../../collections/collection-item/collection-item";
import { selectAll } from '../../../store/selectors/collections.selector';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';

@Component({
  selector: 'side-bar-content',
  imports: [SideBarHeader, AsyncPipe, PortalModule, CollectionItem, CdkDropList, CdkDrag, RequestCollectionItem],
  templateUrl: './side-bar-content.html',
  styleUrl: './side-bar-content.css',
})
export class SideBarContent {
  private store = inject(Store);

  public blurService = inject(BlurService);
  private actionsMenuService = inject(ActionsMenuService);

  public renameCollectionHeader: string = "Переименовать коллекцию";

  public collections = toSignal(this.store.select(selectAll));
  public collections$ = toObservable(this.collections);

 public requests = signal<Record<string, { isLoaded: boolean; requests: RequestModel[] }>>({});
  public requests$: Observable<Record<string, { isLoaded: boolean; requests: RequestModel[] }>> = toObservable(this.requests);

  public openCollections: WritableSignal<Record<string, boolean>> = signal({});

  ngOnInit(): void {
    this.store.dispatch(loadCollections());

    this.store.pipe(
      ofType(createRequestFailure)
    ).subscribe(errorBody => {
      alert(errorBody.error.message);
    });

    this.collections$ = of([
      { id: 'dc378aa8-b42e-468a-bb5d-5dad6e0f9b7b', name: 'TEST 1 ajsdgajkshgdjkhagdkjgsajkdgjakgsdkjgasjdhg', path: 'D:\\1\\Developer\\silver\\Silver.Client\\collections_for_tests\\TEST 1' },
      { id: '33abfac2-d678-481c-aa9a-39ac8361bd3e', name: 'TEST 2', path: 'D:\\1\\Developer\\silver\\Silver.Client\\collections_for_tests\\TEST 2' }
    ]);

    this.openCollections.set((this.collections() as Collection[]).reduce((acc, c) => {
      acc[c.id] = false;
      return acc;
    }, {} as Record<string, boolean>));

  }

  handleCreateRequest(overlay: OverlayRef, request: CreateRequestInfo) {

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

    overlay.dispose();
  }

  handleCloneCollection(overlay: OverlayRef, collectionInfo: CloneCollectionDto) {
    this.store.dispatch(cloneCollection({ collectionInfo }));
    overlay.dispose();
  }

  handleRenameCollection(overlay: OverlayRef, collectionInfo: RenameDto) {
    console.log(`handleRenameCollection ${JSON.stringify(collectionInfo)}`);
    this.store.dispatch(renameCollection({ collectionInfo }));
    overlay.dispose();
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

    console.log(`Данный по коллекции ${collectionId} уже получены`);
  }

  handleRemoveCollection(overlay: OverlayRef, collectionId: string) {
    this.store.dispatch(removeCollection({ collectionId: collectionId }));
    overlay.dispose();
  }

  loadRequestsByCollectionId(collectionId: string, collectionPath: string){
    this.store.dispatch(loadRequests({collectionInfo: {collectionPath: collectionPath, collectionId: collectionId}}))

    this.store.select(selectRequestsByCollectionId({collectionId: collectionId}))
      .subscribe(reqs => {
        console.log(`Обновляем запросы по collectionId: ${collectionId} , пришедшие запросы: ${reqs}`);
        this.requests.update(reqState => ({
          ...reqState,
          [collectionId]: {
            isLoaded: true,
            requests: reqs
          }
        }));

        console.log(`Запросы после обновления: ${JSON.stringify(this.requests())}`);
    });

    if (collectionId === 'dc378aa8-b42e-468a-bb5d-5dad6e0f9b7b') {
      this.requests.update(state => ({
        ...state,
        [collectionId]: {
          isLoaded: true,
          requests: [
            { id: "085059cb-2e3e-4550-b364-aff15fe5c849", name:"asdasd", type:"HTTP", method:"GET", url:"asdasd", headers:null, body:null, collectionId, fileName:"asdasd" },
            { id: "531ce6c4-a7ee-4f85-9015-2e776ab38db0", name:"фывфыв", type:"HTTP", method:"GET", url:"фывфыв", headers:null, body:null, collectionId, fileName:"фывфыв" }
          ]
        }
      }));
    }

    if (collectionId === '33abfac2-d678-481c-aa9a-39ac8361bd3e') {
      this.requests.update(state => ({
        ...state,
        [collectionId]: {
          isLoaded: true,
          requests: [
            { id: "9058196d-801b-44df-9ef8-17f331c958c5", name:"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", type:"HTTP", method:"GET", url:"asdasd", headers:null, body:null, collectionId, fileName:"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" }
          ]
        }
      }))
    };
  }

  
  dropCollection($event: CdkDragDrop<string[]>){
    this.store.dispatch(moveCollection({fromIndex: $event.previousIndex, toIndex: $event.currentIndex}));
  }

  dropRequest($event: CdkDragDrop<string[]>){
    this.store.dispatch(moveRequest({fromIndex: $event.previousIndex, toIndex: $event.currentIndex}));
  }
}
