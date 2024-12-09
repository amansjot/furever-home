import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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
import { Router, RouterLink } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { AlertDialogComponent } from '../../components/alert-dialog/alert-dialog.component';
import { Dialog } from '@angular/cdk/dialog';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  public disableLogin: boolean = false; // Flag to disable login button during processing
  public errorMsg: string = ''; // Error message to display to the user

  // Define the login form with email and password fields
  loginForm: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]), // Email field with validation for required and email format
    password: new FormControl(null, [Validators.required]), // Password field with validation for required input
  });

  constructor(
    private _loginSvc: LoginService, // Inject the login service
    private router: Router, // Inject the router for navigation
    private dialog: Dialog
  ) {}

  // Handle login logic when the form is submitted
  async login() {
    if (!this.loginForm.valid) {
      // Check if the form is valid
      return;
    }

    this.errorMsg = ''; // Clear any previous error messages
    this.disableLogin = true; // Disable the login button

    const email = this.loginForm.get('email')?.value; // Retrieve email value from the form
    const password = this.loginForm.get('password')?.value; // Retrieve password value from the form

    if (email && password) {
      // Ensure both email and password are provided
      const result = await this._loginSvc.login(email, password); // Call the login service

      if (result) {
        this.router.navigate(['/browse']); // Navigate to the browse page on successful login
      } else {
        this.errorMsg = 'Invalid login'; // Display error message for invalid login
        this.disableLogin = false; // Re-enable the login button
      }
    }
  }

  // Handle forgot password logic
  async forgotPassword() {
    const email = this.loginForm.get('email')?.value; // Retrieve email value from the form

    // Validate email field
    if (!email || !this.loginForm.get('email')?.valid) {
      this.errorMsg =
        'Please enter a valid email address to reset your password.'; // Display error for invalid email
      return;
    }

    try {
      await this._loginSvc.forgotPassword(email); // Call the forgot password service
      this.dialog.open(AlertDialogComponent, {
        data: {
          title: 'Check Your Email',
          message: 'Password reset email sent! Please check your inbox.',
        },
        width: '400px',
      });
    } catch (error) {
      this.errorMsg = 'Failed to send reset email. Please try again.'; // Handle error in sending email
    }
  }
}
