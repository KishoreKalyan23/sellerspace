import { Injectable, signal } from '@angular/core';
import { ContactRequest } from '../models/contact-request';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private readonly contactsSignal = signal<ContactRequest[]>([]);

  readonly contacts = this.contactsSignal.asReadonly();

  submitContact(request: ContactRequest): void {
    this.contactsSignal.set([...this.contactsSignal(), request]);
  }
}
