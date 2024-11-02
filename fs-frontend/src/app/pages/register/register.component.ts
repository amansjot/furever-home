import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs'; // Import MatTabsModule
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
    MatButtonModule,
    MatInputModule,
    MatTabsModule // Import MatTabsModule here
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  public errorMsg: string = "";
  public disableRegister: boolean = false;
  public selectedRoleIndex: number = 0;

  registerForm: FormGroup = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, PasswordStrengthValidator]),
    password2: new FormControl('', Validators.required),
    organizationName: new FormControl(''),
    location: new FormControl('')
  }, { validators: passwordMatchValidator() });

  constructor(
    private _loginSvc: LoginService,
    private _router: Router
  ) { }

  ngOnInit(): void {
    this.setSellerValidators(); // Set validators based on the default tab
  }

  onTabChange(index: number) {
    this.selectedRoleIndex = index;
    this.setSellerValidators();
  }

  setSellerValidators() {
    if (this.selectedRoleIndex === 1) { // If "Seller" tab is selected
      this.registerForm.controls['organizationName'].setValidators(Validators.required);
      this.registerForm.controls['location'].setValidators(Validators.required);
    } else { // If "Buyer" tab is selected
      this.registerForm.controls['organizationName'].clearValidators();
      this.registerForm.controls['location'].clearValidators();
    }
    this.registerForm.controls['organizationName'].updateValueAndValidity();
    this.registerForm.controls['location'].updateValueAndValidity();
  }

  register() {
    if (!this.registerForm.valid) {
      return;
    }
    this.disableRegister = true;
    const { email, password, firstName, lastName, organizationName, location } = this.registerForm.value;
    const role = this.selectedRoleIndex === 0 ? 'Buyer' : 'Seller';

    this._loginSvc.register(email, password, firstName, /* lastName, role, organizationName, location */)
      .then((res) => {
        if (res) {
          this._router.navigate(['/home']);
        } else {
          this.errorMsg = "Registration failed";
        }
        this.disableRegister = false;
      }).catch((err) => {
        console.error(err.error);
        this.errorMsg = "Registration failed: " + err.error.error;
        this.disableRegister = false;
      });
  }
}