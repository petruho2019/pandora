import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { PandoraTable } from "../../../../../reuseable/pandora-table/pandora-table";
import { buildHeader, RequestModel, TableRow } from '../../../../../../../../shared/models/requests/request';

@Component({
  selector: 'request-headers',
  imports: [PandoraTable],
  templateUrl: './request-headers.html',
  styleUrl: './request-headers.css',
})
export class RequestHeaders implements OnChanges{

  @Output() headersChanged = new EventEmitter<TableRow[]>();
  @Input() req: RequestModel;

  tableInitialData: TableRow[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['req']) {
      const headers = this.req.headers;

      this.tableInitialData = headers
        ? headers
        : [];
    }
  }

  handleHeadersChanged(tableRows: TableRow[]) {
    this.buildHeaders(tableRows);

    this.headersChanged.emit(this.buildHeaders(tableRows));
  }
  
  buildHeaders(tableRows: TableRow[] ){
    let headers: TableRow[] = [];

    tableRows.forEach(tr => headers.push(buildHeader(tr)));

    return headers
  }

  isRowEmpty(row: TableRow): boolean {
    return row.name.trim() === '' && row.value.trim() === '';
  }
}
