import { Component, EventEmitter, Input, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { RequestModel } from '../../../../../../../../../../shared/models/requests/request';
import { BODY_KIND } from '../../../../../../../../../../shared/models/constants';
import { TextBody } from '../../../../../../../../../../shared/models/requests/http/body';
import { EditorComponent } from "ngx-monaco-editor-v2";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'pandora-text-editor',
  imports: [EditorComponent, FormsModule],
  templateUrl: './pandora-text-editor.html',
  styleUrl: './pandora-text-editor.css',
})
export class PandoraTextEditor implements OnDestroy{
  ngOnDestroy(): void {
    console.log(`ngOnDestroy PandoraTextEditor`);
  }
  localValue = '';

  @Input() req!: RequestModel;
  @Output() valueChanged = new EventEmitter<string>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['req']) {
      const body = this.req.body[BODY_KIND.TEXT] as TextBody;
      this.localValue = body ? body.value : '';
      console.log(`Изменился запрос в TEXT ngOnChanges, установим значение: ${this.localValue}`);
    }
  }

  onCodeChange(value: string) {
    this.localValue = value;

    this.valueChanged.emit(value);
  }
}
