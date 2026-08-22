import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { Product, ProductsService } from '../shared/services/products/products.service';
import { ButtonComponent } from '../shared/ui/button/button.component';
import { EmptyStateComponent } from '../shared/ui/empty-state/empty-state.component';
import { BillingCustomer, PaymentMethod, ProBillingService } from './pro-billing.service';

interface ProBillingLine {
  productId: number;
  name: string;
  unitPrice: number;
  quantity: number;
  taxPercent: number;
  stockAvailable: number;
}

const PRODUCT_SEARCH_INPUT_ID = 'pro-billing-product-search';
const CUSTOMER_MOBILE_INPUT_ID = 'pro-billing-customer-mobile';

@Component({
  selector: 'app-pro-billing',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, ButtonComponent, EmptyStateComponent],
  templateUrl: './pro-billing.component.html',
  styleUrl: './pro-billing.component.css',
})
export class ProBillingComponent implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly proBillingService = inject(ProBillingService);
  private customerSearchTimeout: ReturnType<typeof setTimeout> | undefined;

  readonly productSearchInputId = PRODUCT_SEARCH_INPUT_ID;
  readonly customerMobileInputId = CUSTOMER_MOBILE_INPUT_ID;
  readonly productQuery = signal('');
  readonly highlightedIndex = signal(0);
  readonly lineItems = signal<ProBillingLine[]>([]);

  readonly customerName = signal('');
  readonly customerMobile = signal('');
  readonly customerEmail = signal('');
  readonly customerSuggestions = signal<BillingCustomer[]>([]);

  readonly amountReceived = signal<number | null>(null);
  readonly paymentMethod = signal<PaymentMethod>('Cash');
  readonly isSubmitting = signal(false);
  readonly checkoutError = signal<string | null>(null);
  readonly checkoutSuccess = signal<string | null>(null);

  readonly productMatches = computed<Product[]>(() => {
    const query = this.productQuery().trim().toLowerCase();
    if (!query) {
      return [];
    }

    return this.productsService
      .products()
      .filter((product) => String(product.id) === query || product.name.toLowerCase().includes(query))
      .slice(0, 8);
  });

  readonly subtotal = computed(() => this.lineItems().reduce((total, line) => total + line.unitPrice * line.quantity, 0));
  readonly totalTax = computed(() =>
    this.lineItems().reduce((total, line) => total + this.lineTax(line), 0),
  );
  readonly grandTotal = computed(() => this.subtotal() + this.totalTax());
  readonly balance = computed(() => (this.amountReceived() ?? 0) - this.grandTotal());

  readonly canCheckout = computed(
    () =>
      this.lineItems().length > 0 &&
      this.customerName().trim().length > 0 &&
      this.customerMobile().trim().length > 0 &&
      (this.paymentMethod() !== 'Cash' || (this.amountReceived() ?? 0) >= this.grandTotal()) &&
      !this.isSubmitting(),
  );

  ngOnInit(): void {
    void this.productsService.loadAll();
  }

  onProductQuery(event: Event): void {
    this.productQuery.set((event.target as HTMLInputElement).value);
    this.highlightedIndex.set(0);
  }

  onProductSearchKeydown(event: KeyboardEvent): void {
    const matches = this.productMatches();

    switch (event.key) {
      case 'ArrowDown':
        if (matches.length) {
          event.preventDefault();
          this.highlightedIndex.set(Math.min(this.highlightedIndex() + 1, matches.length - 1));
        }
        break;
      case 'ArrowUp':
        if (matches.length) {
          event.preventDefault();
          this.highlightedIndex.set(Math.max(this.highlightedIndex() - 1, 0));
        }
        break;
      case 'Enter': {
        event.preventDefault();
        const selected = matches[this.highlightedIndex()];
        if (selected) {
          this.addProduct(selected);
        }
        break;
      }
      case 'Escape':
        this.productQuery.set('');
        break;
    }
  }

  addProduct(product: Product): void {
    if (product.stockQuantity <= 0) {
      return;
    }

    const existing = this.lineItems().find((line) => line.productId === product.id);

    if (existing) {
      this.updateLineQuantity(product.id, existing.quantity + 1);
    } else {
      this.lineItems.update((lines) => [
        ...lines,
        {
          productId: product.id,
          name: product.name,
          unitPrice: product.price,
          quantity: 1,
          taxPercent: product.taxPercent,
          stockAvailable: product.stockQuantity,
        },
      ]);
    }

    this.productQuery.set('');
    this.highlightedIndex.set(0);
    this.focusQuantityInput(product.id);
  }

  removeLine(productId: number): void {
    this.lineItems.update((lines) => lines.filter((line) => line.productId !== productId));
  }

  updateLineQuantity(productId: number, quantity: number): void {
    this.lineItems.update((lines) =>
      lines.map((line) =>
        line.productId === productId
          ? { ...line, quantity: Math.min(line.stockAvailable, Math.max(1, Math.floor(quantity) || 1)) }
          : line,
      ),
    );
  }

  onQuantityEnter(event: Event, productId: number): void {
    const value = +(event.target as HTMLInputElement).value;
    this.updateLineQuantity(productId, value);
    this.focusProductSearch();
  }

  onQuantityTab(event: Event, productId: number): void {
    if ((event as KeyboardEvent).shiftKey) {
      return;
    }

    const value = +(event.target as HTMLInputElement).value;
    this.updateLineQuantity(productId, value);
    event.preventDefault();
    this.focusCustomerMobile();
  }

  lineSubtotal(line: ProBillingLine): number {
    return line.unitPrice * line.quantity;
  }

  lineTax(line: ProBillingLine): number {
    return Math.round(this.lineSubtotal(line) * line.taxPercent) / 100;
  }

  lineTotal(line: ProBillingLine): number {
    return this.lineSubtotal(line) + this.lineTax(line);
  }

  onNameInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.customerName.set(value);
    this.checkoutError.set(null);
    this.scheduleCustomerSearch(value);
  }

  onMobileInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.customerMobile.set(value);
    this.checkoutError.set(null);
    this.scheduleCustomerSearch(value);
  }

  onEmailInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.customerEmail.set(value);
    this.checkoutError.set(null);
    this.scheduleCustomerSearch(value);
  }

  onAmountReceivedInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.amountReceived.set(value === '' ? null : Math.max(0, Number(value) || 0));
    this.checkoutError.set(null);
  }

  setPaymentMethod(method: PaymentMethod): void {
    this.paymentMethod.set(method);
    if (method !== 'Cash') {
      this.amountReceived.set(null);
    }
  }

  selectCustomer(customer: BillingCustomer): void {
    this.customerName.set(customer.name);
    this.customerMobile.set(customer.mobile);
    this.customerEmail.set(customer.email ?? '');
    this.customerSuggestions.set([]);
  }

  private scheduleCustomerSearch(query: string): void {
    if (this.customerSearchTimeout) {
      clearTimeout(this.customerSearchTimeout);
    }

    this.customerSearchTimeout = setTimeout(() => {
      void this.proBillingService.searchCustomers(query).then((results) => this.customerSuggestions.set(results));
    }, 300);
  }

  private focusQuantityInput(productId: number): void {
    setTimeout(() => {
      const input = document.getElementById(`pro-billing-qty-${productId}`) as HTMLInputElement | null;
      input?.focus();
      input?.select();
    });
  }

  private focusProductSearch(): void {
    setTimeout(() => {
      document.getElementById(PRODUCT_SEARCH_INPUT_ID)?.focus();
    });
  }

  private focusCustomerMobile(): void {
    setTimeout(() => {
      const input = document.getElementById(CUSTOMER_MOBILE_INPUT_ID) as HTMLInputElement | null;
      input?.focus();
      input?.select();
    });
  }

  async checkout(): Promise<void> {
    if (!this.canCheckout()) {
      return;
    }

    this.isSubmitting.set(true);
    this.checkoutError.set(null);
    this.checkoutSuccess.set(null);

    try {
      const result = await this.proBillingService.checkout({
        clientName: this.customerName().trim(),
        customerMobile: this.customerMobile().trim(),
        customerEmail: this.customerEmail().trim() || undefined,
        amountReceived: this.paymentMethod() === 'Cash' ? this.amountReceived() ?? undefined : undefined,
        paymentMethod: this.paymentMethod(),
        items: this.lineItems().map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
        })),
      });

      const balanceLabel = result.balanceReturned && result.balanceReturned > 0 ? ` Balance returned: ${result.balanceReturned.toFixed(2)}.` : '';
      this.checkoutSuccess.set(`Order #${result.orderId} placed for ${result.clientName}.${balanceLabel}`);

      this.lineItems.set([]);
      this.customerName.set('');
      this.customerMobile.set('');
      this.customerEmail.set('');
      this.amountReceived.set(null);
      this.paymentMethod.set('Cash');
      this.customerSuggestions.set([]);
      void this.productsService.loadAll();
      this.focusProductSearch();
    } catch (error) {
      this.checkoutError.set(error instanceof Error ? error.message : 'Checkout failed. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
