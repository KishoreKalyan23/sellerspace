import { Injectable, signal } from '@angular/core';
import { UserLocation } from '../models/user-location';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly locationsSignal = signal<UserLocation[]>([]);

  readonly locations = this.locationsSignal.asReadonly();

  saveLocation(location: UserLocation): void {
    this.locationsSignal.set([...this.locationsSignal(), location]);
  }
}
