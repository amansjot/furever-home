import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { Router, RouterLink } from '@angular/router';

import { passwordMatchValidator, PasswordStrengthValidator } from './password-validators';
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
    MatTabGroup,
    MatTab,
    MatButtonModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  public errorMsg: string = "";
  public disableRegister: boolean = false;
  public selectedRole: string = "buyer"; // default to buyer

  buyerForm: FormGroup = new FormGroup({
    firstName: new FormControl(null, Validators.required),
    lastName: new FormControl(null, Validators.required),
    location: new FormControl(null, Validators.required),
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [Validators.required, PasswordStrengthValidator]),
    password2: new FormControl(null, Validators.required),
  }, { validators: passwordMatchValidator() });

  sellerForm: FormGroup = new FormGroup({
    firstName: new FormControl(null, Validators.required),
    lastName: new FormControl(null, Validators.required),
    sellerType: new FormControl(null, Validators.required),
    orgName: new FormControl(null, Validators.required),
    location: new FormControl(null, Validators.required),
    contact: new FormControl(null, [Validators.required, Validators.pattern(/^[0-9]{10}$/)]), // basic phone number validation
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [Validators.required, PasswordStrengthValidator]),
    password2: new FormControl(null, Validators.required),
  }, { validators: passwordMatchValidator() });

  constructor(
    private _loginSvc: LoginService,
    private _router: Router
  ) { }

  onTabChange(index: number): void {
    this.selectedRole = index === 0 ? 'buyer' : 'seller';
  }

  register(role: 'buyer' | 'seller') {
    const form = role === 'buyer' ? this.buyerForm : this.sellerForm;
  
    if (!form.valid) {
      this.errorMsg = "Please fill out all required fields correctly.";
      return;
    }
  
    this.disableRegister = true;
    this.errorMsg = "";
  
    // Prepare data for registration
    const formData = form.value;
    const data = {
      username: formData.email,
      password: formData.password,
      role,
      firstName: formData.firstName,
      lastName: formData.lastName,
      location: formData.location,
      ...(role === 'seller' && {
        sellerType: formData.sellerType,
        orgName: formData.orgName,
        contact: formData.contact
      })
    };
  
    this._loginSvc.register(data).then((res) => {
      if (res) {
        this._router.navigate(['/home']);
      } else {
        this.errorMsg = "Registration failed";
      }
      this.disableRegister = false;
    }).catch((err) => {
      console.error(err);
      this.errorMsg = "Registration failed: " + err.error.error;
      this.disableRegister = false;
    });
  }
}
