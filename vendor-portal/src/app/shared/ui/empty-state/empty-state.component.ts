import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.css',
})
export class EmptyStateComponent {
  @Input() icon?: string;
  @Input() message = '';
  @Input() hint?: string;

  /** Set when nested inside a container that already has its own card chrome. */
  @Input() @HostBinding('class.bare') bare = false;

  /** Vertically centers within the parent's available height. */
  @Input() @HostBinding('class.fill') fill = false;
}
