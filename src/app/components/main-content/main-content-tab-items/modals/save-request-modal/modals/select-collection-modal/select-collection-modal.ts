import { Component, EventEmitter, HostListener, inject, Input, OnInit, Output } from '@angular/core';
import { ModalHeader } from "../../../../../../reuseable/modals/modal-header/modal-header";
import { RequestModel } from '../../../../../../../../../shared/models/requests/request';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { selectAll } from '../../../../../../../store/selectors/collections.selector';
import { toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { Collection } from '../../../../../../../../../shared/models/collections/collection';

@Component({
  selector: 'select-collection-modal',
  imports: [ModalHeader, FormsModule],
  templateUrl: './select-collection-modal.html',
  styleUrl: './select-collection-modal.css',
})
export class SelectCollectionModal {


  private store = inject(Store);

  public headerTitle = 'Выберете коллекцию';

  @Input() req: RequestModel;

  @Output() save = new EventEmitter<RequestModel>();
  @Output() close = new EventEmitter();

  private collections$ = this.store.select(selectAll);
  public collections = toSignal(this.collections$);

  onClose(){
    console.log(`${JSON.stringify(this.collections(), null, 2)}`);
    this.close.emit();
  }

  saveRequest() {
    this.save.emit(this.req);
  }

  removeSelectedCollection() {
    this.req.collectionId = null;
  }

  selectCollection(col: Collection) {
    this.req.collectionId = col.id
  }

  getCollName() {
    return this.collections()!.find(c => c.id === this.req.collectionId)!.name;
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if(event.key === 'Escape')
      this.onClose();
  }

  setFileName() {
    this.req.fileName = this.req.name;
  }
}
