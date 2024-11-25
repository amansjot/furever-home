import { AbstractControl, ValidationErrors } from '@angular/forms';

export function atLeastOneSelected(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  return Array.isArray(value) && value.length > 0 ? null : { required: true };
}