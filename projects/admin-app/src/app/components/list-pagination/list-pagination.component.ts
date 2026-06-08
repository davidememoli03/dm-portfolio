import { Component, input, output } from '@angular/core';

@Component({
  selector: 'admin-list-pagination',
  template: `
    @if (totalPages() > 1) {
      <nav class="mt-4 flex items-center justify-center gap-2" aria-label="Pagination">
        <button
          type="button"
          class="action-btn action-btn-ghost"
          [disabled]="page() <= 1"
          (click)="changePage(page() - 1)"
        >
          Previous
        </button>
        <span class="text-sm text-[var(--color-text-muted)]">
          Page {{ page() }} of {{ totalPages() }}
        </span>
        <button
          type="button"
          class="action-btn action-btn-ghost"
          [disabled]="page() >= totalPages()"
          (click)="changePage(page() + 1)"
        >
          Next
        </button>
      </nav>
    }
  `,
})
export class ListPaginationComponent {
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly pageChange = output<number>();

  protected changePage(nextPage: number): void {
    if (nextPage < 1 || nextPage > this.totalPages()) return;
    this.pageChange.emit(nextPage);
  }
}
