import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { SideBarResizeComponent } from "./components/side-bar/side-bar";
import { Store } from '@ngrx/store';
import { loadCollections } from './store/actions/collections.actions';
import { ActionsMenuService } from '../../services/actions-menu-service';

@Component({
  selector: 'app-root',
  imports: [SideBarResizeComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App  {

  private actionsMenuService = inject(ActionsMenuService);

  constructor(private store: Store) {}

  protected readonly title = signal('pandora');

  @HostListener('document:click')
  closeActions() {
    console.log(`Close action menu`);
    this.actionsMenuService.close();
  }

}
