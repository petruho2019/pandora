import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionsInfo } from './collections-info';

describe('CollectionsInfo', () => {
  let component: CollectionsInfo;
  let fixture: ComponentFixture<CollectionsInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionsInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollectionsInfo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
