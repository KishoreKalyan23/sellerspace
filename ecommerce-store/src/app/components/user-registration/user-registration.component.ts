import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { UserProfile } from '../../models/user-profile';

@Component({
  selector: 'app-user-registration',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './user-registration.component.html',
  styleUrl: './user-registration.component.css'
})
export class UserRegistrationComponent {
  readonly userService = inject(UserService);

  form: Partial<UserProfile> = {
    name: '',
    age: 0,
    gender: 'Female',
    mobileNumber: '',
    email: '',
    favoriteProductIds: [],
    preferredCategories: [],
    preferredVendors: []
  };

  submit(): void {
    const user: UserProfile = {
      id: Date.now(),
      name: this.form.name || 'New User',
      age: this.form.age || 0,
      gender: this.form.gender || 'Prefer not to say',
      mobileNumber: this.form.mobileNumber || '',
      email: this.form.email || '',
      favoriteProductIds: this.form.favoriteProductIds || [],
      preferredCategories: this.form.preferredCategories || [],
      preferredVendors: this.form.preferredVendors || []
    };

    this.userService.updateUser(user);
    this.form = {
      name: '',
      age: 0,
      gender: 'Female',
      mobileNumber: '',
      email: '',
      favoriteProductIds: [],
      preferredCategories: [],
      preferredVendors: []
    };
  }
}
