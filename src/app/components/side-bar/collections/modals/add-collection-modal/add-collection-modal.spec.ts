import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCollectionModal } from './add-collection-modal';

describe('AddCollectionModal', () => {
  let component: AddCollectionModal;
  let fixture: ComponentFixture<AddCollectionModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCollectionModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCollectionModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
