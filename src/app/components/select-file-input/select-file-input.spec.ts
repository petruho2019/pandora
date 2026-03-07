import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectFileInput } from './select-file-input';

describe('SelectFileInput', () => {
  let component: SelectFileInput;
  let fixture: ComponentFixture<SelectFileInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectFileInput]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectFileInput);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
