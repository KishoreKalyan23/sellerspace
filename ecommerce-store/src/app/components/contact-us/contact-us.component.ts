import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ContactService } from '../../services/contact.service';
import { ContactRequest } from '../../models/contact-request';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css'
})
export class ContactUsComponent {
  readonly contactService = inject(ContactService);

  form: ContactRequest = {
    id: Date.now(),
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    createdAt: new Date().toISOString()
  };

  submit(): void {
    this.contactService.submitContact({ ...this.form, id: Date.now(), createdAt: new Date().toISOString() });
    this.form = {
      id: Date.now(),
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      createdAt: new Date().toISOString()
    };
  }
}
