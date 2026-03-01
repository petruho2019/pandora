import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideBarHeader } from './side-bar-header';

describe('SideBarHeader', () => {
  let component: SideBarHeader;
  let fixture: ComponentFixture<SideBarHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideBarHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SideBarHeader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
