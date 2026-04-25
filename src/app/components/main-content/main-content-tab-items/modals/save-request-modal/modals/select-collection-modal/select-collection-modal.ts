import { Component, EventEmitter, HostListener, inject, Input, OnInit, Output } from '@angular/core';
import { ModalHeader } from "../../../../../../reuseable/modals/modal-header/modal-header";
import { RequestModel } from '../../../../../../../../../shared/models/requests/request';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { selectAll } from '../../../../../../../store/selectors/collections.selector';
import { toSignal } from '@angular/core/rxjs-interop';
import { Collection } from '../../../../../../../../../shared/models/collections/collection';
import { TabItem } from '../../../../../../../../../shared/models/utils';

@Component({
  selector: 'select-collection-modal',
  imports: [ModalHeader, FormsModule],
  templateUrl: './select-collection-modal.html',
  styleUrl: './select-collection-modal.css',
})
export class SelectCollectionModal {


  private store = inject(Store);

  public headerTitle = 'Выберете коллекцию';

  @Input() req: TabItem;

  @Output() save = new EventEmitter<TabItem>();
  @Output() close = new EventEmitter();

  private collections$ = this.store.select(selectAll);
  public collections = toSignal(this.collections$);

  onClose(){
    this.close.emit();
  }

  saveRequest() {
    this.save.emit(this.req);
  }

  removeSelectedCollection() {
    this.req.request!.request!.collectionId = null;
    this.headerTitle = 'Выбрать коллекцию'; 
  }

  selectCollection(col: Collection) {
    this.req.request!.request!.collectionId = col.id;
    this.headerTitle = 'Сохранить запрос'; 
  }

  getCollName() {
    return this.collections()!.find(c => c.id === this.req.request!.request!.collectionId)!.name;
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if(event.key === 'Escape')
      this.onClose();
  }

  setFileName() {
    this.req.request!.request!.fileName = this.req.request!.request!.name;
  }
}
