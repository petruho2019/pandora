import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorNotification } from './alert-notification';

describe('ErrorNotification', () => {
  let component: ErrorNotification;
  let fixture: ComponentFixture<ErrorNotification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorNotification]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErrorNotification);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
