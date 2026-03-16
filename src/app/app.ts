import { selectRequestError } from './store/selectors/requests.selector';
import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { SideBarResizeComponent } from "./components/side-bar/side-bar";
import { Store } from '@ngrx/store';
import { ActionsMenuService } from '../../services/actions-menu-service';
import { selectCollectionError } from './store/selectors/collections.selector';
import { OverlayRef } from '@angular/cdk/overlay';

@Component({
  selector: 'app-root',
  imports: [SideBarResizeComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  private actionsMenuService = inject(ActionsMenuService);
  private store = inject(Store);


  protected readonly title = signal('pandora');

  ngOnInit(): void {
    this.store.select(selectRequestError()).subscribe((err) => {
      if(err !== null)
        console.log(`${err} (REQUEST APP)`);
    });

    this.store.select(selectCollectionError()).subscribe((err) => {
      if(err !== null)
        console.log(`${err} (COLLECTION APP)`);
    });
  }



  @HostListener('document:click')
  closeActions() {
    console.log(`Close action menu`);
    this.actionsMenuService.close();
  }

}
