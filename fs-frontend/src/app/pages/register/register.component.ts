import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';  // Add MatSelectModule
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
    MatSelectModule  // Import MatSelectModule here
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  public errorMsg: string = "";
  public disableRegister: boolean = false;

  registerForm: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [PasswordStrengthValidator]),
    password2: new FormControl(null),
    role: new FormControl(null, Validators.required)
  }, { validators: passwordMatchValidator() });

  constructor(
    private _loginSvc: LoginService,
    private _router: Router
  ) { }

  register() {
    if (!this.registerForm.valid) {
      return;
    }
    this.disableRegister = true;
    const { email, password, role } = this.registerForm.value;
    this._loginSvc.register(email, password, role).then((res) => {
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
