import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenameCollectionModal } from './rename-collection-modal';

describe('RenameCollectionModal', () => {
  let component: RenameCollectionModal;
  let fixture: ComponentFixture<RenameCollectionModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RenameCollectionModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RenameCollectionModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
