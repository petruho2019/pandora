import { Component, computed, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { RequestModel, TableRow } from '../../../../../../../../../../shared/models/requests/request';
import { BODY_KIND } from '../../../../../../../../../../shared/models/constants';
import { FormUrlEncodedBody } from '../../../../../../../../../../shared/models/requests/http/body';
import { PandoraTable } from "../../../../../../../reuseable/pandora-table/pandora-table";

@Component({
  selector: 'url-form-encoded-body',
  imports: [PandoraTable],
  templateUrl: './url-form-encoded-body.html',
  styleUrl: './url-form-encoded-body.css',
})
export class UrlFormEncodedBody {

  @Output() urlEncodedChanged = new EventEmitter<TableRow[]>();
  @Input() req: RequestModel;

  tableInitialData: TableRow[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['req']) {
      const body = this.req.body[BODY_KIND.FORM_URL_ENCODED] as FormUrlEncodedBody | undefined;

      this.tableInitialData = body
        ? body.fields
        : [];
    }
  }

  handleURLEncodedChanged(tableRows: TableRow[]) {
    this.urlEncodedChanged.emit(tableRows);
  }
  
}
