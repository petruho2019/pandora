import { ChangeDetectorRef, Component, computed, EventEmitter, inject, Input, Output } from '@angular/core';
import { BodyItem } from '../../../../../../../../shared/models/requests/http/http-request-model';
import { RequestModel, TableRow } from '../../../../../../../../shared/models/requests/request';
import { PandoraJsonEditor } from "./raw/pandora-json-editor/pandora-json-editor";
import { MultipartFormBody } from "./form/multipart-form-body/multipart-form-body";
import { UrlFormEncodedBody } from "./form/url-form-encoded-body/url-form-encoded-body";
import { BODY_KIND } from '../../../../../../../../shared/models/constants';
import { PandoraTextEditor } from "./raw/pandora-text-editor/pandora-text-editor";
import { PandoraXmlEditor } from "./raw/pandora-xml-editor/pandora-xml-editor";
import { FileBody } from "./other/file-body/file-body";

@Component({
  selector: 'request-body',
  imports: [PandoraJsonEditor, MultipartFormBody, UrlFormEncodedBody, PandoraTextEditor, PandoraXmlEditor, FileBody],
  templateUrl: './request-body.html',
  styleUrl: './request-body.css',
})
export class RequestBody {

  @Input() req: RequestModel; 
  @Input() selectedBody: BodyItem;

  @Output() multipartChanged = new EventEmitter<TableRow[]>();
  @Output() urlEncodedChanged = new EventEmitter<TableRow[]>();
  @Output() jsonChanged = new EventEmitter<string>();
  @Output() textChanged = new EventEmitter<string>();
  @Output() xmlChanged = new EventEmitter<string>();
  @Output() fileChanged = new EventEmitter<TableRow[]>();
  

  handleURLEncodedChanged(tableRows: TableRow[]) {
    this.urlEncodedChanged.emit(tableRows);
  }

  handleMultipartChanged(tableRows: TableRow[]) {
    this.multipartChanged.emit(tableRows);
  }

  handleJsonBodyChanged(newValue: string){
    this.jsonChanged.emit(newValue);
  }

  handleTextBodyChanged(newValue: string){
    this.textChanged.emit(newValue);
  }

  handleXmlBodyChanged(newValue: string){
    this.xmlChanged.emit(newValue);
  }

  handleFileBodyChanged(files: TableRow[]) {
    this.fileChanged.emit(files)
  }

  isFormBodyType() {
    return this.isMultipartForm() || this.isFormURLEncoded();
  }
  isMultipartForm() {
    return this.selectedBody.kind === BODY_KIND.MULTIPART_FORM;
  }
  isFormURLEncoded() {
    return this.selectedBody.kind === BODY_KIND.FORM_URL_ENCODED;
  }
  isRaw() {
    return this.isJson() || this.isText() || this.isXml();
  }
  isJson() {
    return this.selectedBody.kind === BODY_KIND.JSON;
  }
  isText() {
    return this.selectedBody.kind === BODY_KIND.TEXT;
  }
  isXml() {
    return this.selectedBody.kind === BODY_KIND.XML;
  }
  isNoBody() {
    return this.selectedBody.kind === BODY_KIND.NONE;;
  }

}
