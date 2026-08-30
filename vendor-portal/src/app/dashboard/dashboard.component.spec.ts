import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let component: DashboardComponent;
  let httpMock: HttpTestingController;

  const summaryData = {
    totalClients: 12,
    activeListings: 34,
    lowStockListings: 3,
    outOfStockListings: 1,
    netRevenue: 125000,
    ordersToday: 5,
    ordersThisWeek: 40,
    fulfillmentRate: 92,
    averageOrderValue: 850,
    netRevenueWeekOverWeekChange: 4.2,
    revenueTrend: [10, 20, 40],
    mostActiveClients: [{ name: 'Asha', orderCount: 9, lastOrderDate: '2026-08-20' }],
    bestSellers: [{ name: 'Echo Speaker', units: 40, revenue: 12000, revenueSharePercent: 25 }],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('shows a loading state, then renders the summary once the request resolves', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.loading-state')).not.toBeNull();

    httpMock.expectOne('https://localhost:55142/api/vendor/dashboard-summary').flush({ success: true, data: summaryData });
    fixture.detectChanges();

    expect(component.isLoading()).toBe(false);
    expect(component.error()).toBeNull();
    expect(component.totalClients()).toBe(12);
    expect(fixture.nativeElement.querySelector('.loading-state')).toBeNull();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Asha');
    expect(text).toContain('Echo Speaker');
  });

  it('shows an error state when the request fails', () => {
    fixture.detectChanges();

    httpMock.expectOne('https://localhost:55142/api/vendor/dashboard-summary').flush('Server error', {
      status: 500,
      statusText: 'Internal Server Error',
    });
    fixture.detectChanges();

    expect(component.isLoading()).toBe(false);
    expect(component.error()).toBe('Unable to load dashboard data. Please try again later.');
    expect(fixture.nativeElement.querySelector('app-empty-state')).not.toBeNull();
  });

  it('computes inventory status and revenue chart bar heights from the loaded summary', () => {
    fixture.detectChanges();
    httpMock.expectOne('https://localhost:55142/api/vendor/dashboard-summary').flush({ success: true, data: summaryData });
    fixture.detectChanges();

    expect(component.inventoryStatus()).toBe('Attention needed');
    expect(component.revenueChartBars()).toEqual([25, 50, 100]);
  });

  it('reports a stable inventory status when nothing is out of stock', () => {
    fixture.detectChanges();
    httpMock
      .expectOne('https://localhost:55142/api/vendor/dashboard-summary')
      .flush({ success: true, data: { ...summaryData, outOfStockListings: 0 } });
    fixture.detectChanges();

    expect(component.inventoryStatus()).toBe('Stable');
  });

  it('toggles the sidebar collapsed state', () => {
    fixture.detectChanges();
    httpMock.expectOne('https://localhost:55142/api/vendor/dashboard-summary').flush({ success: true, data: summaryData });
    fixture.detectChanges();

    expect(component.isSidebarCollapsed()).toBe(false);
    component.toggleSidebar();
    expect(component.isSidebarCollapsed()).toBe(true);
  });
});
