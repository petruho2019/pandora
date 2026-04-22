import { Component, computed, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { RequestModel, TableRow } from '../../../../../../../../../../shared/models/requests/request';
import { PandoraTable } from "../../../../../../../reuseable/pandora-table/pandora-table";
import { BODY_KIND } from '../../../../../../../../../../shared/models/constants';
import { MultipartBody } from '../../../../../../../../../../shared/models/requests/http/body';

@Component({
  selector: 'multipart-form-body',
  imports: [PandoraTable],
  templateUrl: './multipart-form-body.html',
  styleUrl: './multipart-form-body.css',
})
export class MultipartFormBody implements OnChanges{

  @Output() multipartChanged = new EventEmitter<TableRow[]>();
  @Input() req: RequestModel;

  tableInitialData: TableRow[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['req']) {
      const body = this.req.body[BODY_KIND.MULTIPART_FORM] as MultipartBody | undefined;

      this.tableInitialData = body
        ? body.fields.map(f => ({
            id: f.id,
            isActive: f.isActive,
            name: f.key,
            value: f.type === 'text' ? f.value : '',
            fileInfo: {
              fileValue: f.type === 'file' ? f.file : null,
              contentType: f.contentType ?? ''
            }
          }))
        : [];
    }
  }

  handleMultipartChanged(tableRows: TableRow[]) {
    this.multipartChanged.emit(tableRows);
  }
}
