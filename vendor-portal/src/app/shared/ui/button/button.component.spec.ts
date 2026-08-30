import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let fixture: ComponentFixture<ButtonComponent>;
  let component: ButtonComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
  });

  it('defaults to a primary, medium, non-disabled button', () => {
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.className).toContain('btn-primary');
    expect(button.className).toContain('btn-md');
    expect(button.disabled).toBe(false);
    expect(button.getAttribute('type')).toBe('button');
  });

  it('reflects the variant, size, and disabled inputs', () => {
    component.variant = 'secondary';
    component.size = 'sm';
    component.disabled = true;
    component.type = 'submit';
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.className).toContain('btn-secondary');
    expect(button.className).toContain('btn-sm');
    expect(button.disabled).toBe(true);
    expect(button.getAttribute('type')).toBe('submit');
  });

  it('applies the full-width host class when fullWidth is set', () => {
    component.fullWidth = true;
    fixture.detectChanges();

    expect(fixture.nativeElement.classList).toContain('full-width');
  });
});
