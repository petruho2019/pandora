import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertNotificationContainer } from './alert-notification-container';

describe('AlertNotificationContainer', () => {
  let component: AlertNotificationContainer;
  let fixture: ComponentFixture<AlertNotificationContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertNotificationContainer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlertNotificationContainer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
