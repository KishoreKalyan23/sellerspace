import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ShopSummary, SuperAdminService } from '../superadmin.service';
import { ShopListComponent } from './shop-list.component';

describe('ShopListComponent', () => {
  let fixture: ComponentFixture<ShopListComponent>;
  let component: ShopListComponent;
  let superAdminService: { shops: ReturnType<typeof vi.fn>; loadShops: ReturnType<typeof vi.fn> };

  const shops: ShopSummary[] = [
    {
      vendorId: 1,
      name: 'Jane',
      storeName: 'Jane Store',
      email: 'jane@example.com',
      isApproved: true,
      createdAt: '2026-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    superAdminService = {
      shops: vi.fn(() => shops),
      loadShops: vi.fn(() => Promise.resolve()),
    };

    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: SuperAdminService, useValue: superAdminService }],
    });

    fixture = TestBed.createComponent(ShopListComponent);
    component = fixture.componentInstance;
  });

  it('loads shops on init and clears loading state', async () => {
    fixture.detectChanges();
    expect(superAdminService.loadShops).toHaveBeenCalled();
    await fixture.whenStable();

    expect(component.isLoading()).toBe(false);
  });

  it('renders the shop list with a link to shop details', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Jane Store');
    expect(text).toContain('Approved');

    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a.link-button');
    expect(link.getAttribute('href')).toBe('/superadmin/shops/1');
  });

  it('shows a pending status tag for unapproved shops', async () => {
    superAdminService.shops.mockReturnValue([{ ...shops[0], isApproved: false }]);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Pending');
  });

  it('shows an empty state when there are no shops', async () => {
    superAdminService.shops.mockReturnValue([]);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('No shops registered yet.');
  });
});
