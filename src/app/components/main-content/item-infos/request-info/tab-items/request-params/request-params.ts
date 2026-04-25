import { ChangeDetectorRef, Component, EventEmitter, inject, Input, model, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RequestModel, TableRow } from '../../../../../../../../shared/models/requests/request';
import { PandoraTable } from "../../../../../reuseable/pandora-table/pandora-table";

@Component({
  selector: 'request-params',
  imports: [FormsModule, PandoraTable],
  templateUrl: './request-params.html',
  styleUrl: './request-params.css',
})
export class RequestParams implements OnChanges {


  @Output() urlParamsChanged = new EventEmitter<string>();
  @Input() req: RequestModel;

  tableInitialData: TableRow[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['req']) {
      const params = this.req.params;

      this.tableInitialData = params ? [...params] : [];
    }
  }

  handleParamsTableChanged(tableRows: TableRow[]) {
    this.req.params = tableRows; 
    this.urlParamsChanged.emit(this.buildUrlParams(tableRows));
  }
  
  buildUrlParams(tableRows: TableRow[] ){
    return '?' + tableRows.filter(row => row.isActive && !this.isRowEmpty(row)).map(row => `${row.name}=${row.value}`).join('&');
  }

  isRowEmpty(row: TableRow): boolean {
    return row.name.trim() === '' && row.value.trim() === '';
  }
}
