import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ShopDashboardSummary, SuperAdminService } from '../superadmin.service';
import { ShopDetailComponent } from './shop-detail.component';

describe('ShopDetailComponent', () => {
  let fixture: ComponentFixture<ShopDetailComponent>;
  let superAdminService: { getShopDetail: ReturnType<typeof vi.fn> };

  const summary: ShopDashboardSummary = {
    totalClients: 10,
    activeListings: 5,
    lowStockListings: 2,
    outOfStockListings: 1,
    netRevenue: 5000,
    ordersToday: 3,
    ordersThisWeek: 12,
    fulfillmentRate: 95,
    averageOrderValue: 250,
  };

  function setup(vendorId: string, result: ShopDashboardSummary | null = summary): void {
    superAdminService = { getShopDetail: vi.fn(() => Promise.resolve(result)) };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: SuperAdminService, useValue: superAdminService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ vendorId }) } },
        },
      ],
    });

    fixture = TestBed.createComponent(ShopDetailComponent);
  }

  it('loads the shop detail for the route vendorId', async () => {
    setup('7');
    fixture.detectChanges();

    expect(superAdminService.getShopDetail).toHaveBeenCalledWith(7);
    await fixture.whenStable();
    await fixture.whenStable();

    expect(fixture.componentInstance.isLoading()).toBe(false);
    expect(fixture.componentInstance.summary()).toEqual(summary);
  });

  it('renders the shop dashboard stats', async () => {
    setup('7');
    fixture.detectChanges();
    await fixture.whenStable();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('5000');
    expect(text).toContain('95%');
    expect(text).toContain('250');
  });

  it('shows a fallback message when the shop report could not be loaded', async () => {
    setup('7', null);
    fixture.detectChanges();
    await fixture.whenStable();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain("Could not load this shop's report.");
  });
});
