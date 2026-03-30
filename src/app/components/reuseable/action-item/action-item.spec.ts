import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionItem } from './action-item';

describe('ActionItem', () => {
  let component: ActionItem;
  let fixture: ComponentFixture<ActionItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
