import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService, Vendor } from '../../shared/services/auth/auth.service';
import { VendorDetailsComponent } from './vendor-details.component';

describe('VendorDetailsComponent', () => {
  let fixture: ComponentFixture<VendorDetailsComponent>;
  let currentVendor: ReturnType<typeof vi.fn>;

  const vendor: Vendor = {
    id: '1',
    name: 'Jane Vendor',
    email: 'jane@example.com',
    storeName: 'Jane Store',
    gstNumber: 'GST123',
    mobile: '9999999999',
    role: 'ShopAdmin',
  };

  function setup(vendorValue: Vendor | null): void {
    currentVendor = vi.fn(() => vendorValue);

    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: { currentVendor } }],
    });

    fixture = TestBed.createComponent(VendorDetailsComponent);
    fixture.detectChanges();
  }

  it('renders the vendor store details when a vendor is present', () => {
    setup(vendor);

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Jane Store');
    expect(text).toContain('GST123');
    expect(text).toContain('9999999999');
    expect(text).toContain('jane@example.com');
  });

  it('falls back to "Not provided" for missing optional fields', () => {
    setup({ id: '2', name: 'No Extras', email: 'no@example.com', role: 'ShopAdmin' });

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Not provided');
  });

  it('shows an empty state when there is no vendor', () => {
    setup(null);

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Vendor details are unavailable for this session.');
  });
});
