import { Component, computed, EventEmitter, input, model, Output } from '@angular/core';
import { PandoraTable } from '../../../../reuseable/pandora-table/pandora-table';
import { Collection } from '../../../../../../../shared/models/collections/collection';
import { TableRow } from '../../../../../../../shared/models/requests/request';

@Component({
  selector: 'coll-headers',
  imports: [PandoraTable],
  templateUrl: './coll-headers.html',
  styleUrl: './coll-headers.css',
})
export class CollHeaders {
  public coll = input<Collection>();
  public collHeaders = model<Record<string, TableRow[]>>();

  @Output() onHeadersSave = new EventEmitter<TableRow[]>();

  public tableInitialData = computed(() => {
    return this.collHeaders()![this.coll()!.id];
  });

  handleHeadersChanged(headers: TableRow[]) {
    this.collHeaders.update((initialHeaders) => ({
      ...initialHeaders,
      [this.coll()!.id]: headers,
    }));
  }

  saveHeaders() {
    this.onHeadersSave.emit(this.collHeaders()![this.coll()!.id]);
  }
}
