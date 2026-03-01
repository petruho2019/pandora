import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideBarResizeComponent } from './side-bar';

describe('SideBar', () => {
  let component: SideBarResizeComponent;
  let fixture: ComponentFixture<SideBarResizeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideBarResizeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SideBarResizeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
