import { ChangeDetectorRef, Component, computed, EventEmitter, inject, Input, Output } from '@angular/core';
import { BodyItem } from '../../../../../../../../shared/models/requests/http/http-request-model';
import { RequestModel, TableRow } from '../../../../../../../../shared/models/requests/request';
import { PandoraJsonEditor } from "./raw/pandora-json-editor/pandora-json-editor";
import { MultipartFormBody } from "./form/multipart-form-body/multipart-form-body";
import { UrlFormEncodedBody } from "./form/url-form-encoded-body/url-form-encoded-body";
import { BODY_KIND } from '../../../../../../../../shared/models/constants';

@Component({
  selector: 'request-body',
  imports: [PandoraJsonEditor, MultipartFormBody, UrlFormEncodedBody],
  templateUrl: './request-body.html',
  styleUrl: './request-body.css',
})
export class RequestBody {

  @Input() req: RequestModel; 
  @Input() selectedBody: BodyItem;

  @Output() multipartChanged = new EventEmitter<TableRow[]>();
  @Output() urlEncodedChanged = new EventEmitter<TableRow[]>();
  @Output() jsonChanged = new EventEmitter<string>();

  handleURLEncodedChanged(tableRows: TableRow[]) {
    this.urlEncodedChanged.emit(tableRows);
  }

  handleMultipartChanged(tableRows: TableRow[]) {
    this.multipartChanged.emit(tableRows);
  }

  handleJsonBodyChanged(newJsonValue: string){
    this.jsonChanged.emit(newJsonValue);
  }

  isMultipartForm() {
    console.log(`Сейчас в request-body нахоидтся запрос с id: ${this.req.id}`);
    return this.selectedBody.kind === BODY_KIND.MULTIPART_FORM;
  }
  isFormURLEncoded() {
    return this.selectedBody.kind === BODY_KIND.FORM_URL_ENCODED;;
  }
  isJson() {
    return this.selectedBody.kind === BODY_KIND.JSON;;
  }
  isNoBody() {
    return this.selectedBody.kind === BODY_KIND.NONE;;
  }

  
}
