import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloneCollection } from './clone-collection';

describe('CloneCollection', () => {
  let component: CloneCollection;
  let fixture: ComponentFixture<CloneCollection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CloneCollection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CloneCollection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
