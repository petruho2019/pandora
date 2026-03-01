import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRequestModal } from './add-request-modal';

describe('AddRequestModal', () => {
  let component: AddRequestModal;
  let fixture: ComponentFixture<AddRequestModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddRequestModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddRequestModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
