import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { AuthService } from '../../shared/services/auth/auth.service';

@Component({
  selector: 'app-vendor-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vendor-details.component.html',
  styleUrl: './vendor-details.component.css',
})
export class VendorDetailsComponent {
  private readonly authService = inject(AuthService);

  readonly vendor = this.authService.currentVendor;
}
