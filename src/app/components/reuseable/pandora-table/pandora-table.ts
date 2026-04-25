import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, inject, Input, OnChanges, Output, signal, SimpleChanges, ViewChild } from '@angular/core';
import { TableRow } from '../../../../../shared/models/requests/request';
import { v4 as uuidv4 } from 'uuid';
import { CdkDrag, CdkDragMove } from '@angular/cdk/drag-drop';
import { MIN_NAME_COLUMN_WIDTH_PX } from '../../../../../shared/models/constants';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'pandora-table',
  imports: [CdkDrag, FormsModule],
  templateUrl: './pandora-table.html',
  styleUrl: './pandora-table.css',
})
export class PandoraTable implements AfterViewChecked, OnChanges{

  private changeDetector = inject(ChangeDetectorRef);

  @Output() tableChanged = new EventEmitter<TableRow[]>();
  @Input() canAddFile: boolean;
  @Input() canChangeContentType: boolean;
  @Input() initialData: TableRow[] | null = null;
  
  @ViewChild('table') table: ElementRef<HTMLElement>;
  @ViewChild('nameHeader') nameHeader!: ElementRef<HTMLElement>;
  @ViewChild('resizer') resizer!: ElementRef<HTMLElement>;

  public resizedHeight = signal(60);
  protected defaultWidth = 300;
  protected nameColumnWidth = signal(this.defaultWidth);
  
  public paramsTableData: TableRow[] = [
    { id: uuidv4(), isActive: true, name: '', value: '', fileInfo: { fileValue: null, contentType: '' } }
  ] ;

  protected onDragMoved(event: CdkDragMove) {
    const rect = this.nameHeader.nativeElement.getBoundingClientRect();
    let newWidth = event.pointerPosition.x - rect.left;

    newWidth = Math.max(MIN_NAME_COLUMN_WIDTH_PX, newWidth);
    newWidth = Math.min(this.table.nativeElement.clientWidth - 300, newWidth);

    this.nameColumnWidth.set(newWidth);

    event.source.element.nativeElement.style.transform = 'none';
  }

  updateCurrentWidth(newWidth: any){
    this.nameColumnWidth.set(newWidth);
  }

  ngAfterViewChecked() {
    this.calculateResizerHeight();
    this.changeDetector.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialData']) {
      if (this.initialData && this.initialData.length > 0) {
        if (this.isRowEmpty(this.initialData[this.initialData.length - 1])) {
          this.paramsTableData = this.initialData;
          return;
        }
        this.paramsTableData = [...this.initialData, this.newEmptyRow()];
      } else {
        this.paramsTableData = [this.newEmptyRow()];
      }
    }
  }
  

  calculateResizerHeight(){
    this.resizedHeight.set(this.table?.nativeElement?.clientHeight);
  }

  setIsActive(id: string){
    const tabItem = this.paramsTableData.find(p => p.id === id)!;
    tabItem.isActive = !tabItem?.isActive 

    this.tableChanged.emit(this.paramsTableData);
  }

  onRowInput(id: string) {
    this.manageDynamicRows(id);
    this.tableChanged.emit(this.paramsTableData);
  }

  deleteRow(id: string){
    if(this.paramsTableData.length === 1) return;

    this.paramsTableData.splice(this.paramsTableData.findIndex(p => p.id === id), 1);

    this.tableChanged.emit(this.paramsTableData);
  }

  private manageDynamicRows(changedId: string) {
    const len = this.paramsTableData.length;
    const lastIndex = len - 1;
    const lastRow = this.paramsTableData[lastIndex];
    // Если изменяется последняя строка то добавляем
    if(lastRow.id === changedId){
      this.paramsTableData.push(this.newEmptyRow());
      return;
    }
    const penultimateRow = this.paramsTableData[lastIndex - 1]
    // Если все строки пустные и мы удаляем последний айтем то удаляем и все остальные
    if(penultimateRow.id === changedId && !this.paramsTableData.find(row => this.isRowEmpty(row) === false)){
      this.paramsTableData.length = 0;
      this.paramsTableData.push(this.newEmptyRow());
      return;
    }
    // Если изменен последний препоследний и у последнего ничего не заполнено, то удаляем его
    if (penultimateRow.id === changedId && this.isRowEmpty(penultimateRow) && this.isRowEmpty(lastRow))  {
      this.paramsTableData.pop();
      return;
    }
  }


  addFile(event: Event, row: TableRow) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if(file){
      row!.fileInfo!.fileValue = file;
    }

    this.manageDynamicRows(row.id);
    this.tableChanged.emit(this.paramsTableData);
  }

  isRowEmpty(row: TableRow): boolean {

    if(this.canChangeContentType && this.canAddFile){
      return row.name.trim() === '' && row.value.trim() === '' && row.fileInfo?.contentType?.trim() === '' && !this.isFileValueSet(row)
    }

    if(this.canChangeContentType){
      return row.name.trim() === '' && row.value.trim() === '' && row.fileInfo?.contentType?.trim() === ''
    }

    return row.name.trim() === '' && row.value.trim() === '';
    ;
  }

  isLastRow(tableRow: TableRow){
    const len = this.paramsTableData.length;
    const lastIndex = len - 1;
    return this.paramsTableData[lastIndex]?.id === tableRow.id;
  }

  newEmptyRow(): TableRow {
    return { id: uuidv4(), isActive: true, name: '', value: '', fileInfo: { fileValue: null, contentType: '' } };
  }

  removeExtension(filename: string) {
    return filename.substring(0, filename.lastIndexOf('.')) || filename;
  }

  isFileValueSet(tableRow: TableRow){
    return (tableRow.fileInfo?.fileValue !== null && tableRow.fileInfo?.fileValue !== undefined); 
  }


  isValueSet(tableRow: TableRow) {
    return (tableRow.value !== null && tableRow.value !== undefined && tableRow.value !== '') 
  }

  deleteFile(row: TableRow){
    const tr = this.paramsTableData.find(tr => tr.id === row.id);
    tr!.fileInfo = { fileValue: null, contentType: tr!.fileInfo!.contentType };

    this.manageDynamicRows(row.id);
    this.tableChanged.emit(this.paramsTableData);
  }

  @HostListener('window:resize')
  onResize() {
    const nameHeaderRect = this.nameHeader.nativeElement.getBoundingClientRect();
    const tableRect = this.table.nativeElement.getBoundingClientRect();
    let newWidth = nameHeaderRect.right - tableRect.left;

    newWidth = Math.max(MIN_NAME_COLUMN_WIDTH_PX, newWidth);
    newWidth = Math.min(this.table.nativeElement.clientWidth - 300, newWidth);

    this.nameColumnWidth.set(newWidth);
  }

}
