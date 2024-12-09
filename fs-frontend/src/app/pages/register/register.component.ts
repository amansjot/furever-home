import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule, MatTabGroup, MatTab } from '@angular/material/tabs';
import { Router, RouterLink } from '@angular/router';

import {
  passwordMatchValidator,
  PasswordStrengthValidator,
} from './password-validators';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatTabsModule, // Import MatTabsModule here
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  public errorMsg: string = '';
  public disableRegister: boolean = false;
  public selectedRoleIndex: number = 0; // Track selected tab index
  showOrgName = false;

  buyerForm: FormGroup = new FormGroup(
    {
      firstName: new FormControl(null, Validators.required),
      lastName: new FormControl(null, Validators.required),
      location: new FormControl(null, Validators.required),
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [
        Validators.required,
        PasswordStrengthValidator,
      ]),
      password2: new FormControl(null, Validators.required),
    },
    { validators: passwordMatchValidator() }
  );

  sellerForm: FormGroup = new FormGroup(
    {
      firstName: new FormControl(null, Validators.required),
      lastName: new FormControl(null, Validators.required),
      sellerType: new FormControl(null, Validators.required),
      orgName: new FormControl(null, Validators.required),
      location: new FormControl(null, Validators.required),
      // contact: new FormControl(null, [Validators.required, Validators.pattern(/^[0-9]{10}$/)]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [
        Validators.required,
        PasswordStrengthValidator,
      ]),
      password2: new FormControl(null, Validators.required),
    },
    { validators: passwordMatchValidator() }
  );

  constructor(private _loginSvc: LoginService, private _router: Router) {}

  ngOnInit(): void {
    this.setFormValidators(); // Set initial validators based on selected tab
  }

  onSellerTypeChange() {
    const sellerType = this.sellerForm.get('sellerType')?.value;
    this.showOrgName = sellerType === 'breeder' || sellerType === 'shelter';
  
    const orgNameControl = this.sellerForm.get('orgName');
    if (this.showOrgName) {
      orgNameControl?.setValidators(Validators.required);
    } else {
      orgNameControl?.clearValidators();
    }
    orgNameControl?.updateValueAndValidity(); // Ensure validation is updated immediately
  }

  onTabChange(index: number): void {
    this.selectedRoleIndex = index;
    this.setFormValidators();
  }

  private setFormValidators(): void {
    if (this.selectedRoleIndex === 1) {
      // Seller tab selected
      // this.sellerForm.controls['orgName'].setValidators(Validators.required);
      this.sellerForm.controls['location'].setValidators(Validators.required);
      // this.sellerForm.controls['contact'].setValidators([Validators.required, Validators.pattern(/^[0-9]{10}$/)]);
    } else {
      // Buyer tab selected
      this.buyerForm.controls['location'].setValidators(Validators.required);
    }

    // this.sellerForm.controls['orgName'].updateValueAndValidity();
    this.sellerForm.controls['location'].updateValueAndValidity();
    // this.sellerForm.controls['contact'].updateValueAndValidity();
    this.buyerForm.controls['location'].updateValueAndValidity();
  }

  register(role: 'buyer' | 'seller') {
    const form = role === 'buyer' ? this.buyerForm : this.sellerForm;

    if (!form.valid) {
      this.errorMsg = 'Please fill out all required fields correctly.';
      return;
    }

    this.disableRegister = true;
    this.errorMsg = '';

    const formData = form.value;
    const data = {
      username: formData.email,
      password: formData.password,
      profilePic: "https://i.imgur.com/AZFfFIy.png", // Default profile picture
      firstName: formData.firstName,
      lastName: formData.lastName,
      location: formData.location,
      ...(role === 'seller' && {
        sellerType: formData.sellerType,
        contact: formData.email,
        ...(this.showOrgName && { orgName: formData.orgName }),
        ...(!this.showOrgName && { orgName: formData.firstName + "'s Rehoming" }),
      }),
    };

    this._loginSvc
      .register(data)
      .then((res) => {
        if (res) {
          // Redirect buyer to questionnaire page, seller to home page
          if (role === 'buyer') {
            // --- Temporarily disabled ---
            // this._router.navigate(['/questionnaire']);
            this._router.navigate(['/questionnaire']);
          } else {
            this._router.navigate(['/browse']);
          }
        } else {
          this.errorMsg = 'Registration failed';
        }
        this.disableRegister = false;
      })
      .catch((err) => {
        console.error(err);
        this.errorMsg = 'Registration failed: ' + err.error.error;
        this.disableRegister = false;
      });
  }
}
