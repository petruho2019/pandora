import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloneCollectionModal } from './clone-collection-modal';

describe('CloneCollectionModal', () => {
  let component: CloneCollectionModal;
  let fixture: ComponentFixture<CloneCollectionModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CloneCollectionModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CloneCollectionModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
