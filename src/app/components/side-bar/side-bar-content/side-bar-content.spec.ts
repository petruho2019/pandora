import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideBarContent } from './side-bar-content';

describe('SideBarContent', () => {
  let component: SideBarContent;
  let fixture: ComponentFixture<SideBarContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideBarContent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SideBarContent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
