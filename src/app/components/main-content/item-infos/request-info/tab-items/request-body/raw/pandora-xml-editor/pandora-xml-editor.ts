import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { EditorComponent } from "ngx-monaco-editor-v2";
import { RequestModel } from '../../../../../../../../../../shared/models/requests/request';
import { BODY_KIND } from '../../../../../../../../../../shared/models/constants';
import { XmlBody } from '../../../../../../../../../../shared/models/requests/http/body';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'pandora-xml-editor',
  imports: [EditorComponent, FormsModule],
  templateUrl: './pandora-xml-editor.html',
  styleUrl: './pandora-xml-editor.css',
})
export class PandoraXmlEditor {
  isValid = true;
  errorMessage = '';
  localValue = '';

  private xmlParser: DOMParser = new DOMParser();

  @Input() req!: RequestModel;
  @Output() valueChanged = new EventEmitter<string>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['req']) {
      const body = this.req.body[BODY_KIND.XML] as XmlBody;
      this.localValue = body ? body.value : '';
    }
  }

  onCodeChange(value: string) {
    this.localValue = value;

    const doc = this.xmlParser.parseFromString(value, "application/xml");

    if(doc.getElementsByTagName('parsererror').length) {
      this.isValid = false;
      this.errorMessage = 'Некорректный xml';
    }
    else {
      this.isValid = true;
      this.errorMessage = '';
    }

    this.valueChanged.emit(value);
  }
}
