import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'ghost' = 'primary';
  @Input() size: 'md' | 'sm' = 'md';
  @Input() disabled = false;
  @Input() @HostBinding('class.full-width') fullWidth = false;
}
