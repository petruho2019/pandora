import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CollectionElectronService } from '../../../../services/collection-electron-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'select-file-input',
  imports: [FormsModule],
  templateUrl: './select-file-input.html',
  styleUrl: './select-file-input.css',
})
export class SelectFileInput {

  private electronService = inject(CollectionElectronService);

  @Input() placeholder: string;
  @Input() label: string;
  @Output() onPathSelected = new EventEmitter();
  @Input() selectedPath: string;

  selectFolder(){
    console.log("Select folder");
    this.electronService.selectFolder().then((path: string | null) => {
      if (path) {
        this.selectedPath = path
        this.onPathSelected.emit(path);
      }
    });
  }
}
