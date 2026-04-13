import { Component, EventEmitter, Input, model, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RequestModel, TableRow } from '../../../../../../../../shared/models/requests/request';
import { PandoraTable } from "../../../../../reuseable/pandora-table/pandora-table";

@Component({
  selector: 'request-params',
  imports: [FormsModule, PandoraTable],
  templateUrl: './request-params.html',
  styleUrl: './request-params.css',
})
export class RequestParams implements OnInit {

  @Output() urlParamsChanged = new EventEmitter<string>();
  @Input() req: RequestModel;

  ngOnInit(): void {
    this.tableInitialData = { [this.req.id]: this.getTableInitialData() };
    console.log(`Создается request params компонент! Значение в таблицу: ${JSON.stringify(this.tableInitialData, null , 2)}`);
  }

  tableInitialData: Record<string , TableRow[]> = {};

  getTableInitialData() {
    return this.req.params;
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
