import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseModalIcon } from './close-modal-icon';

describe('CloseModalIcon', () => {
  let component: CloseModalIcon;
  let fixture: ComponentFixture<CloseModalIcon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CloseModalIcon]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CloseModalIcon);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
