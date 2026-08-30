import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  let fixture: ComponentFixture<EmptyStateComponent>;
  let component: EmptyStateComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
  });

  it('renders the message and hint', () => {
    component.message = 'No products yet';
    component.hint = 'Add your first product to get started';
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('No products yet');
    expect(text).toContain('Add your first product to get started');
  });

  it('applies bare and fill host classes when set', () => {
    component.bare = true;
    component.fill = true;
    fixture.detectChanges();

    const classList = (fixture.nativeElement as HTMLElement).classList;
    expect(classList).toContain('bare');
    expect(classList).toContain('fill');
  });

  it('does not apply bare/fill classes by default', () => {
    fixture.detectChanges();

    const classList = (fixture.nativeElement as HTMLElement).classList;
    expect(classList).not.toContain('bare');
    expect(classList).not.toContain('fill');
  });
});
