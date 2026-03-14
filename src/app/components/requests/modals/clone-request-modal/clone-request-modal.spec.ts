import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloneRequestModal } from './clone-request-modal';

describe('CloneRequestModal', () => {
  let component: CloneRequestModal;
  let fixture: ComponentFixture<CloneRequestModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CloneRequestModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CloneRequestModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
