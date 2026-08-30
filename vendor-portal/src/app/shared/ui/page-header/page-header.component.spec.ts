import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { PageHeaderComponent } from './page-header.component';

describe('PageHeaderComponent', () => {
  let fixture: ComponentFixture<PageHeaderComponent>;
  let component: PageHeaderComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(PageHeaderComponent);
    component = fixture.componentInstance;
  });

  it('renders the eyebrow, title, and description', () => {
    component.eyebrow = 'Settings';
    component.title = 'Vendor details';
    component.description = 'Manage your store profile';
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Settings');
    expect(text).toContain('Vendor details');
    expect(text).toContain('Manage your store profile');
  });

  it('renders with an empty title by default and no eyebrow/description', () => {
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent?.trim() ?? '';
    expect(text).toBe('');
  });
});
