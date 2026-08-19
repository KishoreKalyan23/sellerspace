import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LocationService } from '../../services/location.service';
import { UserLocation } from '../../models/user-location';

@Component({
  selector: 'app-location-picker',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './location-picker.component.html',
  styleUrl: './location-picker.component.css'
})
export class LocationPickerComponent {
  readonly locationService = inject(LocationService);

  selectedMap = 'Downtown Hub';

  form: UserLocation = {
    id: Date.now(),
    label: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    mapSelection: 'Downtown Hub'
  };

  saveLocation(): void {
    this.locationService.saveLocation({ ...this.form, id: Date.now(), mapSelection: this.selectedMap });
    this.form = {
      id: Date.now(),
      label: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      mapSelection: this.selectedMap
    };
  }
}
