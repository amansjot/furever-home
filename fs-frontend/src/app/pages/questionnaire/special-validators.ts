import { AbstractControl, ValidationErrors } from '@angular/forms';

// Validator for Multi-Select form fields
export function atLeastOneSelected(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  return Array.isArray(value) && value.length > 0 ? null : { required: true };
}

// Validator for ZIP code format
export function validZipCode(control: AbstractControl): ValidationErrors | null {
  const zipCodePattern = /^\d{5}$/; 
  const value = control.value;
  return zipCodePattern.test(value) ? null : { invalidZipCode: true };
}