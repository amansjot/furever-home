import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Config } from '../config';
import { Observable, ReplaySubject, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { jwtDecode }  from 'jwt-decode';

interface TokenResponseObject {
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private isAdminCached: boolean | null = null;
  private isSellerCached: boolean | null = null;
  private isBuyerCached: boolean | null = null;

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
  public isAdmin(): Observable<boolean> {
    if (this.isAdminCached !== null) {
      return of(this.isAdminCached);
    }
    return this.httpClient
      .get<{ hasRole: boolean }>(`${Config.apiBaseUrl}/security/hasrole/admin`)
      .pipe(
        map((response) => {
          this.isAdminCached = response.hasRole; // Cache the result
          return response.hasRole;
        }),
        catchError((error) => {
          console.error(error);
          return of(false);
        })
      );
  }

  /* Check if the User is a Seller */
  public isSeller(): Observable<boolean> {
    if (this.isSellerCached !== null) {
      return of(this.isSellerCached);
    }
    return this.httpClient
      .get<{ hasRole: boolean }>(`${Config.apiBaseUrl}/security/hasrole/seller`)
      .pipe(
        map((response) => {
          this.isSellerCached = response.hasRole; // Cache the result
          return response.hasRole;
        }),
        catchError((error) => {
          console.error(error);
          return of(false);
        })
      );
  }

  /* Check if the User is a Buyer */
  public isBuyer(): Observable<boolean> {
    if (this.isBuyerCached !== null) {
      return of(this.isBuyerCached);
    }
    return this.httpClient
      .get<{ hasRole: boolean }>(`${Config.apiBaseUrl}/security/hasrole/buyer`)
      .pipe(
        map((response) => {
          this.isBuyerCached = response.hasRole; // Cache the result
          return response.hasRole;
        }),
        catchError((error) => {
          console.error(error);
          return of(false);
        })
      );
  }

  public getAuthenticatedUserId(): string | null {
    if (!this.token) {
      return null;
    }

    try {
      const decodedToken: any = jwtDecode(this.token);
      return decodedToken?._id || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  public getAuthenticatedSellerLocation(): string | null {
    if (!this.token) {
      return null;
    }

    try {
      const decodedToken: any = jwtDecode(this.token);
      return decodedToken?.location || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
  

  /* Authorize the Token with Server */
  public authorize(): Observable<boolean> {
    return this.httpClient
      .get<TokenResponseObject>(`${Config.apiBaseUrl}/security/authorize`)
      .pipe(
        map((response) => {
          this.token = response.token;
          return response.token.length > 0;
        }),
        catchError((error) => {
          console.error(error);
          this.token = '';
          return of(false);
        })
      );
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
          next: async (response) => {
            if (response.token && response.token.length > 0) {
              this.token = response.token;
              await this.fetchRoles(); // Fetch roles after login
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

  /* Fetch roles once after login */
  private async fetchRoles(): Promise<void> {
    try {
      const isAdminResponse = await this.isAdmin().toPromise();
      const isSellerResponse = await this.isSeller().toPromise();
      const isBuyerResponse = await this.isBuyer().toPromise();
      this.isAdminCached = isAdminResponse ?? false;
      this.isSellerCached = isSellerResponse ?? false;
      this.isBuyerCached = isBuyerResponse ?? false;
    } catch (error) {
      console.error('Error fetching roles:', error);
      this.isAdminCached = false;
      this.isSellerCached = false;
      this.isBuyerCached = false;
    }
  }

  /* Logout Function */
  public logout(): void {
    this.token = '';
    this.isAdminCached = null;
    this.isSellerCached = null;
    this.isBuyerCached = null;
    this.loggedIn.next(false);
  }

  /* Flexible Register Function for Buyer or Seller */
  public async register(data: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.httpClient
        .post<TokenResponseObject>(
          Config.apiBaseUrl + '/security/register',
          data
        )
        .subscribe({
          next: (response) => {
            if (response.token && response.token.length > 0) {
              this.token = response.token;
              this.loggedIn.next(true);
              this.fetchRoles(); // Fetch roles on registration
              this._router.navigate(['/browse']);
              resolve(true);
            } else {
              this.token = '';
              this.loggedIn.next(false);
              resolve(false);
            }
          },
          error: (error) => {
            this.token = '';
            this.loggedIn.next(false);
            console.error(error);
            reject(error);
          },
        });
    });
  }
}
