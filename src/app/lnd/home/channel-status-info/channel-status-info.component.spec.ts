import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelStatusInfoComponent } from './channel-status-info.component';

describe('ChannelStatusInfoComponent', () => {
  let component: ChannelStatusInfoComponent;
  let fixture: ComponentFixture<ChannelStatusInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChannelStatusInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChannelStatusInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
