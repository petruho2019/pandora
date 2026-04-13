import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PandoraTable } from "../../../../../reuseable/pandora-table/pandora-table";
import { buildHeader, RequestModel, TableRow } from '../../../../../../../../shared/models/requests/request';

@Component({
  selector: 'request-headers',
  imports: [PandoraTable],
  templateUrl: './request-headers.html',
  styleUrl: './request-headers.css',
})
export class RequestHeaders implements OnInit{

  @Output() headersChanged = new EventEmitter<TableRow[]>();
  @Input() req: RequestModel;

  ngOnInit(): void {
    this.tableInitialData = { [this.req.id]: this.getTableInitialData() };
    console.log(`Создается request params компонент! Значение в таблицу: ${JSON.stringify(this.tableInitialData, null , 2)}`);
  }

  tableInitialData: Record<string , TableRow[]> = {};

  getTableInitialData() {
    console.log(`Получаем хедеры по запросу с id: ${this.req.id}, вот они: ${JSON.stringify(this.tableInitialData[this.req.id], null , 2)}`);
    return this.tableInitialData[this.req.id];
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
