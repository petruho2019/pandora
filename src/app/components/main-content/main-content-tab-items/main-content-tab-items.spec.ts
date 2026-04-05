import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainContentTabItems } from './main-content-tab-items';

describe('MainContentTabItems', () => {
  let component: MainContentTabItems;
  let fixture: ComponentFixture<MainContentTabItems>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainContentTabItems]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainContentTabItems);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
