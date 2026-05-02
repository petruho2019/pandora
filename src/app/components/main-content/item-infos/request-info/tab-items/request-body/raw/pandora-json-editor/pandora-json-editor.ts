import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import * as monaco from 'monaco-editor';
import { BODY_KIND } from '../../../../../../../../../../shared/models/constants';
import { RequestModel } from '../../../../../../../../../../shared/models/requests/request';
import { JsonBody } from '../../../../../../../../../../shared/models/requests/http/body';

@Component({
  selector: 'pandora-json-editor',
  imports: [MonacoEditorModule, FormsModule],
  templateUrl: './pandora-json-editor.html',
  styleUrl: './pandora-json-editor.css',
})
export class PandoraJsonEditor implements OnChanges {
  isValid = true;
  errorMessage = '';
  localValue = '';

  @Input() req!: RequestModel;
  @Output() valueChanged = new EventEmitter<string>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['req']) {
      const body = this.req.body[BODY_KIND.JSON] as JsonBody;
      this.localValue = body ? body.value : '';
    }
  }

  onCodeChange(value: string) {
    this.localValue = value;

    try {
      JSON.parse(value);
      this.valueChanged.emit(value);
    } catch (e: any) {
      this.valueChanged.emit(value);
    }
  }
}