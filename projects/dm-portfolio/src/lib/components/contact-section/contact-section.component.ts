import { Component, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { PortfolioProfile } from '../../models/portfolio.models';
import { PortfolioApiService } from '../../services/portfolio-api.service';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

@Component({
  selector: 'dm-contact-section',
  imports: [ReactiveFormsModule, TranslateModule, ScrollRevealDirective],
  templateUrl: './contact-section.component.html',
  styleUrl: './contact-section.component.css',
})
export class ContactSectionComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(PortfolioApiService);
  private readonly translate = inject(TranslateService);

  readonly profile = input.required<PortfolioProfile>();

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
    subject: ['', [Validators.maxLength(150)]],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(5000)]],
    hp_field: [''],
  });

  readonly status = signal<FormStatus>('idle');
  readonly errorKey = signal<string>('contact.form.errorGeneric');

  readonly submitting = computed(() => this.status() === 'submitting');
  readonly succeeded = computed(() => this.status() === 'success');
  readonly errored = computed(() => this.status() === 'error');

  readonly identityLegend = toSignal(this.translate.stream('contact.form.identityLegend'), {
    initialValue: this.translate.instant('contact.form.identityLegend'),
  });

  readonly messageLegend = toSignal(this.translate.stream('contact.form.messageLegend'), {
    initialValue: this.translate.instant('contact.form.messageLegend'),
  });

  submit(): void {
    if (this.submitting()) {
      return;
    }

    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.status.set('error');
      this.errorKey.set('contact.form.errorValidation');
      return;
    }

    this.status.set('submitting');
    this.errorKey.set('contact.form.errorGeneric');

    const value = this.form.getRawValue();
    this.api
      .sendContact({
        name: value.name.trim(),
        email: value.email.trim(),
        subject: value.subject.trim() || undefined,
        message: value.message.trim(),
        locale: (this.translate.getCurrentLang() || 'it') as 'it' | 'en',
        hp_field: value.hp_field,
      })
      .subscribe({
        next: () => {
          this.status.set('success');
          this.form.reset();
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 429) {
            this.errorKey.set('contact.form.errorRateLimit');
          } else if (err.status === 400) {
            this.errorKey.set('contact.form.errorValidation');
          } else {
            this.errorKey.set('contact.form.errorGeneric');
          }
          this.status.set('error');
        },
      });
  }

  reset(): void {
    this.form.reset();
    this.status.set('idle');
  }

  fieldHasError(controlName: 'name' | 'email' | 'message', errorKey: string): boolean {
    const control = this.form.controls[controlName];
    return control.touched && control.hasError(errorKey);
  }
}
