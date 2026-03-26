import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestCollectionItem } from './request-item';

describe('RequestCollectionItem', () => {
  let component: RequestCollectionItem;
  let fixture: ComponentFixture<RequestCollectionItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestCollectionItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestCollectionItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
