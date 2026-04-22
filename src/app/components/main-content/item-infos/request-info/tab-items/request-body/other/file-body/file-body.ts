import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { PandoraFileTable } from "../../../../../../../reuseable/pandora-file-table/pandora-file-table";
import { RequestModel, TableRow } from '../../../../../../../../../../shared/models/requests/request';
import { BODY_KIND } from '../../../../../../../../../../shared/models/constants';
import { FileBody as HttpFileBody } from '../../../../../../../../../../shared/models/requests/http/body';

@Component({
  selector: 'file-body',
  imports: [PandoraFileTable],
  templateUrl: './file-body.html',
  styleUrl: './file-body.css',
})
export class FileBody {

  @Output() fileChanged = new EventEmitter<TableRow[]>();

  @Input() req: RequestModel;

  tableInitialData: TableRow[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['req']) {
      const body = this.req.body[BODY_KIND.FILE] as HttpFileBody | undefined;

      this.tableInitialData = body
        ? body.files
        : [];
    }
  }

  handleFileTableChanged(files: TableRow[]) {
    this.fileChanged.emit(files);
  }

}
