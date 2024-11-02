import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Config } from '../config';
import { ReplaySubject } from 'rxjs';
import { Router } from '@angular/router';

interface TokenResponseObject {
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(private httpClient: HttpClient, private _router: Router) {
    this.loggedIn.next(this.token.length > 0);
  }

  /* Token Handling with Local Storage */
  public get token(): string {
    return localStorage.getItem('token') || '';
  }

  public set token(value: string) {
    this.loggedIn.next(value.length > 0);
    localStorage.setItem('token', value);
  }

  public loggedIn: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

  /* Check if the User is Admin */
  public async isAdmin(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.httpClient
        .get<{ hasRole: boolean }>(
          `${Config.apiBaseUrl}/security/hasrole/admin`
        )
        .subscribe({
          next: (response) => resolve(response.hasRole),
          error: (error) => reject(error),
        });
    });
  }

  /* Authorize the Token with Server */
  public async authorize(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.httpClient
        .get<TokenResponseObject>(`${Config.apiBaseUrl}/security/authorize`)
        .subscribe({
          next: (response) => {
            this.token = response.token;
            resolve(response.token.length > 0);
          },
          error: (error) => reject(error),
        });
    });
  }

  /* Login Function */
  public login(username: string, password: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.httpClient
        .post<TokenResponseObject>(`${Config.apiBaseUrl}/security/login`, {
          username,
          password,
        })
        .subscribe({
          next: (response) => {
            if (response.token && response.token.length > 0) {
              this.token = response.token;
              resolve(true);
            } else {
              this.token = '';
              resolve(false);
            }
          },
          error: (error) => {
            this.token = '';
            console.error(error);
            reject(error);
          },
        });
    });
  }

  /* Logout Function */
  public logout(): void {
    this.token = '';
  }

  /* Flexible Register Function for Buyer or Seller */
  public async register(data: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.httpClient.post<TokenResponseObject>(Config.apiBaseUrl + "/security/register", data).subscribe({
        next: (response) => {
          if (response.token && response.token.length > 0) {
            this.token = response.token;  // Set token to log the user in
            this.loggedIn.next(true);     // Update the login state
            this._router.navigate(['/home']);
            resolve(true);
          } else {
            this.token = "";
            this.loggedIn.next(false);
            resolve(false);
          }
        },
        error: (error) => {
          this.token = "";
          this.loggedIn.next(false);
          console.error(error);
          reject(error);
        }
      });
    });
  }
}
