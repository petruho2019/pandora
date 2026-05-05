import {
  Component,
  effect,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  signal,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { TableRow } from '../../../../../shared/models/requests/request';
import { v4 as uuidv4 } from 'uuid';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { Store } from '@ngrx/store';
import { addFile } from '../../../store/actions/common.actions';
import { getFileNameFromPath } from '../../../app';
import { FileModel } from '../../../../../shared/models/files/file';
import { selectFilesByReqId } from '../../../store/selectors/files.selector';

@Component({
  selector: 'pandora-file-table',
  imports: [FormsModule, NgClass],
  templateUrl: './pandora-file-table.html',
  styleUrl: './pandora-file-table.css',
})
export class PandoraFileTable implements OnChanges, OnInit {
  private store = inject(Store);

  @Output() tableChanged = new EventEmitter<TableRow[]>();

  @Input() initialData: TableRow[] | null = null;
  @Input({ required: true }) reqId: string;

  @ViewChild('table') table: ElementRef<HTMLElement>;
  @ViewChild('nameHeader') nameHeader!: ElementRef<HTMLElement>;
  @ViewChild('resizer') resizer!: ElementRef<HTMLElement>;

  public files = signal<FileModel[]>([]).asReadonly();

  public tableData: TableRow[] = [];

  public activeFile: TableRow;

  constructor() {
    effect(() => {
      console.log(`Изменились файлы, текущее состояние: ${JSON.stringify(this.files(), null, 2)}`);
      const files = this.files();

      for (const f of files) {
        let tr = this.tableData.find((tr) => tr.id === f.tableRowId);

        if (!tr) continue;

        tr.fileInfo = {
          path: f.filePath,
          contentType: tr.fileInfo?.contentType as string | null,
        };

        this.tableChanged.emit(this.tableData);
      }
    });
  }

  ngOnInit(): void {
    this.files = this.store.selectSignal(selectFilesByReqId(this.reqId));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialData']) {
      if (this.initialData) {
        this.tableData = this.initialData;
        const activeFile = this.tableData.find((tr) => tr.isActive);
        if (!activeFile) return;
        this.activeFile = activeFile;
      }
    }
  }

  deleteRow(id: string) {
    if (this.activeFile.id === id) {
      const newSelectedFile = this.tableData.filter((td) => td.id !== this.activeFile.id)[0];

      if (newSelectedFile) {
        newSelectedFile.isActive = true;
        this.activeFile = newSelectedFile;
      }
    }

    this.tableData.splice(
      this.tableData.findIndex((p) => p.id === id),
      1,
    );

    this.tableChanged.emit(this.tableData);
  }

  addFile(row: TableRow) {
    this.store.dispatch(
      addFile({
        tableRowId: row.id,
        reqId: this.reqId!,
        contentType: row.fileInfo?.contentType as string | null,
      }),
    );

    this.tableChanged.emit(this.tableData);
  }

  deleteFile(row: TableRow) {
    const tr = this.tableData.find((tr) => tr.id === row.id);
    tr!.fileInfo = { path: null, contentType: null };

    this.tableChanged.emit(this.tableData);
  }

  selectActive(tableRow: TableRow) {
    this.setInactiveFile(this.activeFile.id);

    this.activeFile = tableRow;

    this.setActiveFile(tableRow.id);

    this.tableChanged.emit(this.tableData);
  }

  newEmptyFileRow() {
    const emptyTableRow: TableRow = {
      id: uuidv4(),
      isActive: false,
      name: '',
      value: '',
      fileInfo: { path: null, contentType: '' },
    };
    if (!this.activeFile) {
      emptyTableRow.isActive = true;
      this.activeFile = emptyTableRow;
      this.tableData.push(emptyTableRow);
    } else {
      this.tableData.push(emptyTableRow);
    }
    this.tableChanged.emit(this.tableData);
  }

  getFileNameFromPath(path: string | null | undefined) {
    return getFileNameFromPath(path);
  }

  private setActiveFile(id: string) {
    this.tableData.find((td) => td.id === id)!.isActive = true;
  }

  private setInactiveFile(id: string) {
    this.tableData.find((td) => td.id === id)!.isActive = false;
  }
}
