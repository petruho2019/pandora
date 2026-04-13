import { AfterViewInit, Component, computed, effect, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2'
import { RequestModel } from '../../../../../../../../../../shared/models/requests/request';
import { JsonBody } from '../../../../../../../../../../shared/models/requests/http/bodies/body';
import { BODY_KIND } from '../../../../../../../../../../shared/models/constants';

@Component({
  selector: 'pandora-json-editor',
  imports: [MonacoEditorModule, FormsModule],
  templateUrl: './pandora-json-editor.html',
  styleUrl: './pandora-json-editor.css',
})
export class PandoraJsonEditor {

  constructor() {
    effect(() => {
      this.localValue = this.jsonValue();
    });
  };
  
  isValid = true;
  errorMessage = '';
  localValue = '';

  @Input() req: RequestModel;
  @Output() valueChanged = new EventEmitter<string>();

  jsonValue = computed(() => {
    const body = this.req.body?.[BODY_KIND.JSON] as JsonBody;

    if (!body) return '';

    return body.value ?? '';
  });

  editorOptions = {
    theme: 'vs-dark',
    language: 'json',
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 13,
    lineNumbers: 'on',
    scrollBeyondLastLine: false
  };

  onCodeChange(value: string) {
    this.localValue = value;

    try {
      JSON.parse(value);

      this.isValid = true;
      this.errorMessage = '';

      this.valueChanged.emit(value);
    } catch (e: any) {
      this.isValid = false;
      this.errorMessage = e.message;
    }
  }
}

