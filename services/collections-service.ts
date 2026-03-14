import { Store } from '@ngrx/store';
import { inject, Injectable } from "@angular/core";
import { selectAll } from '../src/app/store/selectors/collections.selector'

@Injectable({ providedIn: 'root'})
export class CollectionsService {
    store = inject(Store);

    private _collections$  = this.store.select(selectAll);
    
}