import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResizableBar } from './resizable-bar';

describe('ResizableBar', () => {
  let component: ResizableBar;
  let fixture: ComponentFixture<ResizableBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResizableBar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResizableBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
