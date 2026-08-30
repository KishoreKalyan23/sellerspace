import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ConnectivityService } from './connectivity.service';

describe('ConnectivityService', () => {
  let originalOnLine: boolean;

  beforeEach(() => {
    originalOnLine = navigator.onLine;
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', { value: originalOnLine, configurable: true });
  });

  it('initializes isOnline from navigator.onLine', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

    const service = TestBed.inject(ConnectivityService);

    expect(service.isOnline()).toBe(false);
  });

  it('sets isOnline to false when the window reports an offline event', () => {
    const service = TestBed.inject(ConnectivityService);

    window.dispatchEvent(new Event('offline'));

    expect(service.isOnline()).toBe(false);
  });

  it('sets isOnline to true when the window reports an online event', () => {
    const service = TestBed.inject(ConnectivityService);

    window.dispatchEvent(new Event('offline'));
    window.dispatchEvent(new Event('online'));

    expect(service.isOnline()).toBe(true);
  });
});
