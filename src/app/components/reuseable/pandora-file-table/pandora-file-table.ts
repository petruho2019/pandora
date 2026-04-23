import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { TableRow } from '../../../../../shared/models/requests/request';
import { v4 as uuidv4 } from 'uuid';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
  selector: 'pandora-file-table',
  imports: [FormsModule, NgClass],
  templateUrl: './pandora-file-table.html',
  styleUrl: './pandora-file-table.css',
})
export class PandoraFileTable implements OnChanges {
  
  @Output() tableChanged = new EventEmitter<TableRow[]>();
  @Input() initialData: TableRow[] | null = null;
  
  @ViewChild('table') table: ElementRef<HTMLElement>;
  @ViewChild('nameHeader') nameHeader!: ElementRef<HTMLElement>;
  @ViewChild('resizer') resizer!: ElementRef<HTMLElement>;

  public tableData: TableRow[] = [];

  public selectedFile: TableRow;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialData']) {
      if (this.initialData) {
        this.tableData = this.initialData;
      }
    }
  }

  deleteRow(id: string){
    if(this.selectedFile.id === id){
      const newSelectedFile = this.tableData.filter(td => td.id !== this.selectedFile.id)[0];

      if(newSelectedFile) {
        newSelectedFile.isActive = true;
        this.selectedFile = newSelectedFile;
      }
    }

    this.tableData.splice(this.tableData.findIndex(p => p.id === id), 1);

    this.tableChanged.emit(this.tableData);
  }

  addFile(event: Event, row: TableRow) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if(file){
      row!.fileInfo!.fileValue = file;
      row!.fileInfo!.contentType = file.type;
    }

    this.tableChanged.emit(this.tableData);
  }

  deleteFile(row: TableRow){
    const tr = this.tableData.find(tr => tr.id === row.id);
    tr!.fileInfo = { fileValue: null, contentType: null };

    this.tableChanged.emit(this.tableData);
  }

  selectFile(tableRow: TableRow) {
    this.setInactiveFile(this.selectedFile.id);

    this.selectedFile = tableRow;

    this.setActiveFile(tableRow.id);

    this.tableChanged.emit(this.tableData);
  }

  newEmptyFileRow() {
    const emptyTableRow: TableRow = { id: uuidv4(), isActive: false, name: '', value: '', fileInfo: { fileValue: null, contentType: '' } };
    if(!this.selectedFile){
      emptyTableRow.isActive = true;
      this.selectedFile = emptyTableRow;
      this.tableData.push(emptyTableRow);
    }
    else {
      this.tableData.push(emptyTableRow);
    }
    this.tableChanged.emit(this.tableData);
  }

  private setActiveFile(selectedFileId: string) {
    this.tableData.find(td => td.id === selectedFileId)!.isActive = true;
  }

  private setInactiveFile(selectedFileId: string) {
    this.tableData.find(td => td.id === selectedFileId)!.isActive = false;
  }
}
