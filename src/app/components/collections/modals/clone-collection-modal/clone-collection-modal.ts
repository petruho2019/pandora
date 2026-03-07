import { ChangeDetectorRef, Component, EventEmitter, HostListener, inject, Input, OnInit, Output } from '@angular/core';
import { ModalHeader } from "../../../reuseable/modal-header/modal-header";
import { SelectFileInput } from "../../../select-file-input/select-file-input";
import { ElectronService } from '../../../../services/electron-service';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { cloneCollection } from '../../../../store/actions/collections.actions';
import { CloneCollectionDto } from '../../../../../../shared/models/collections/dto/collection-action-dtos';

@Component({
  selector: 'clone-collection-modal',
  imports: [ModalHeader, SelectFileInput, FormsModule],
  templateUrl: './clone-collection-modal.html',
  styleUrl: './clone-collection-modal.css',
})
export class CloneCollectionModal implements OnInit {
  private electronService = inject(ElectronService)
  private changeDetectorRef = inject(ChangeDetectorRef)

  headerTitle: string = "Клонировать коллекцию";
  fileInputLabel: string = "Путь"
  fileInputPlaceholder: string = "Путь к коллекции"

  canBeEdit: boolean = false;
  
  @Input() collectionName: string;
  @Input() collectionId: string;
  @Output() onClose = new EventEmitter();
  @Output() onClone = new EventEmitter();

  newCollectionName: string;
  newFolderName: string;
  collectionPath: string;

  ngOnInit(): void {
    this.newCollectionName = `${this.collectionName} copy`;
    this.newFolderName = this.newCollectionName;
  }

  onPathSelected(selectedPath: string){
    this.collectionPath = selectedPath;
  }

  selectPath(){
    this.electronService.selectFolder().then((path: string | null) => {
      if (path) {
        this.collectionPath = path;
        this.changeDetectorRef.detectChanges(); 
      }
    });
  }

  changeFolderNameEditMode(){
    this.canBeEdit = !this.canBeEdit;
  }

  cloneCollection(){
    let collectionInfo: CloneCollectionDto = {
      collectionName: this.newCollectionName,
      collectionPath: this.collectionPath,
      folderName: this.newFolderName,
      sourceCollectionId: this.collectionId
    }

    this.onClone.emit(collectionInfo)

    this.onClose.emit();
  }

  close(){
    this.onClose.emit();
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if(event.key === 'Escape')
      this.close();
  }
}
