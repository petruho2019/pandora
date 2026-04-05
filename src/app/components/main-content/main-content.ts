import { Component } from "@angular/core";
import { MainContentHeader } from "./main-content-header/main-content-header";
import { MainContentTabItems } from "./main-content-tab-items/main-content-tab-items";

@Component({
  selector: 'main-content',
  templateUrl: './main-content.html',
  styleUrl: './main-content.css',
  imports: [MainContentHeader, MainContentTabItems],
})
export class MainContent  {

}
