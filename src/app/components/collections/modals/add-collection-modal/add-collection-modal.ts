import { Component, EventEmitter, inject, Output, output } from '@angular/core';
import { Store } from '@ngrx/store';
import { addCollection } from '../../../../store/actions/collections.actions';
import { FormsModule } from '@angular/forms'
import { ElectronService } from '../../../../services/electron-service';

@Component({
  selector: 'add-collection-modal',
  imports: [FormsModule],
  templateUrl: './add-collection-modal.html',
  styleUrl: './add-collection-modal.css',
})
export class AddCollectionModal {
    private store = inject(Store);
    private electronService = inject(ElectronService);
      
    collectionName = '';
    collectionPath = '';

    @Output() closeModal = new EventEmitter();

    @Output() addCollecton = new EventEmitter();

    addCollection() {
      this.addCollecton.emit({ 
          name: this.collectionName, 
          path: this.collectionPath
        });

      this.close();
      }

    selectFolder(){
      console.log("Select folder");
      this.electronService.selectFolder().then((path: string | null) => {
        if (path) {
          this.collectionPath = path;
        }
      });
    }

    close() {
      this.collectionName = '';
      this.collectionPath = '';
      this.closeModal.emit();
    }
}
