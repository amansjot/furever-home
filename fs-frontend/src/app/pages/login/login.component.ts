import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,RouterLink,MatCardModule,MatFormFieldModule,MatButtonModule,MatInputModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  public disableLogin: boolean = false;
  public errorMsg: string = "";
  loginForm: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [Validators.required]),
  });

  constructor(
    private _loginSvc: LoginService,
    private router: Router
  ) { }

  async login() {
    if (!this.loginForm.valid) {
      return;
    }
    this.errorMsg="";
    this.disableLogin=true;
    const email=this.loginForm.get("email")?.value;
    const password=this.loginForm.get("password")?.value;
    if (email && password){
    const result=await this._loginSvc.login(email,password);
    if (result){
      this.router.navigate(["/browse"]);
    }
    this.errorMsg="Invalid login";
    this.disableLogin=false;
    }


  }

  async forgotPassword() {
    const email = this.loginForm.get("email")?.value;
    if (!email || !this.loginForm.get("email")?.valid) {
      this.errorMsg = "Please enter a valid email address to reset your password.";
      return;
    }
  
    try {
      await this._loginSvc.forgotPassword(email);
      alert("Password reset email sent! Please check your inbox.");
    } catch (error) {
      this.errorMsg = "Failed to send reset email. Please try again.";
    }
  }
}