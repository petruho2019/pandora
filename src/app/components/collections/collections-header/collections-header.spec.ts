import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionsHeader } from './collections-header';

describe('CollectionsHeader', () => {
  let component: CollectionsHeader;
  let fixture: ComponentFixture<CollectionsHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionsHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollectionsHeader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
