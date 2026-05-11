import { Component, inject, input, Input } from '@angular/core';
import { Collection } from '../../../../../../shared/models/collections/collection';
import { Store } from '@ngrx/store';
import { selectTotal } from '../../../../store/selectors/requests.selectors';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'collection-info',
  imports: [AsyncPipe],
  templateUrl: './collection-info.html',
  styleUrl: './collection-info.css',
})
export class CollectionInfo {
  private store = inject(Store);

  public coll = input<Collection>();

  public requestQuantity = this.store.select(selectTotal);
}
