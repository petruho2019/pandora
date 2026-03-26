import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'alert-notification',
  imports: [],
  templateUrl: './alert-notification.html',
  styleUrl: './alert-notification.css',
})
export class ErrorNotification {

  @Input() message: string;

  @Output() mouseEnter = new EventEmitter();
  @Output() mouseLeave = new EventEmitter();

  handleMouseEnter(){
    this.mouseEnter.emit();
  }

  handleMouseLeave(){
    this.mouseLeave.emit();
  }
}
