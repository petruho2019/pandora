import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteRequestModal } from './delete-request-modal';

describe('DeleteRequestModal', () => {
  let component: DeleteRequestModal;
  let fixture: ComponentFixture<DeleteRequestModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteRequestModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteRequestModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
