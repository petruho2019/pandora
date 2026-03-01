import { Component, OnInit, signal } from '@angular/core';
import { SideBarResizeComponent } from "./components/side-bar/side-bar";
import { Store } from '@ngrx/store';
import { loadCollections } from './store/actions/collections.actions';

@Component({
  selector: 'app-root',
  imports: [SideBarResizeComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App  {

  constructor(private store: Store) {}

  protected readonly title = signal('silver');

}
