import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class ActionsMenuService {
  private _openedId = new BehaviorSubject<string | null>(null);
  openedId$ = this._openedId.asObservable();

  open(id: string) {
    console.log(`Open: ${id}`);
    this._openedId.next(id);
  }

  get currentId(): string | null {
    return this._openedId.value;
  }

  close() {
    this._openedId.next(null);
  }
}
