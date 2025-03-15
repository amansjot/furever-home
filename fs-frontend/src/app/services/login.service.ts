import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Config } from '../config';
import { Observable, ReplaySubject, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

// Interface for the token response object
interface TokenResponseObject {
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  // Cached role-check results to avoid repeated API calls
  private isAdminCached: boolean | null = null;
  private isSellerCached: boolean | null = null;
  private isBuyerCached: boolean | null = null;

  constructor(private httpClient: HttpClient, private _router: Router) {
    // Initialize the logged-in state based on the presence of a token
    this.loggedIn.next(this.token.length > 0);
  }

  /* Token Handling with Local Storage */

  // Getter for the token stored in local storage
  public get token(): string {
    const token = localStorage.getItem('token') || '';
    return token;
  }

  // Setter for the token, also updates the logged-in state
  public set token(value: string) {
    this.loggedIn.next(value.length > 0);
    localStorage.setItem('token', value);
  }

  // Observable to track the logged-in state
  public loggedIn: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

  /* Check if the User is Admin */
  public isAdmin(): Observable<boolean> {
    if (this.isAdminCached !== null) {
      return of(this.isAdminCached); // Return cached value if available
    }
    return this.httpClient
      .get<{ hasRole: boolean }>(`${Config.apiBaseUrl}/security/hasrole/admin`)
      .pipe(
        map((response) => {
          this.isAdminCached = response.hasRole; // Cache the result
          return response.hasRole;
        }),
        catchError((error) => {
          console.error(error); // Log any errors
          return of(false); // Return false on error
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
          this.isSellerCached = response.hasRole;
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
          this.isBuyerCached = response.hasRole;
          return response.hasRole;
        }),
        catchError((error) => {
          console.error(error);
          return of(false);
        })
      );
  }

  /* Forgot Password Functionality */
  public forgotPassword(email: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.httpClient
        .post<TokenResponseObject>(`${Config.apiBaseUrl}/security/forgot-password`, { email })
        .subscribe({
          next: async (response) => {
            if (response.token && response.token.length > 0) {
              this.token = response.token; // Store the new token
              resolve(true);
            } else {
              this.token = '';
              resolve(false);
            }
          },
          error: (error) => {
            this.token = '';
            console.error(error); // Log the error
            reject(error);
          },
        });
    });
  }

  /* Retrieve the Authenticated User ID from the Token */
  public getAuthenticatedUserId(): string | null {
    if (!this.token) {
      return null; // Return null if no token is present
    }

    try {
      const decodedToken: any = jwtDecode(this.token);
      return decodedToken?._id || null; // Extract the user ID from the token
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /* Retrieve Roles from the Token */
  public getAuthenticatedRoles(): string[] {
    if (!this.token) {
      return []; // Default value if no token is present
    }

    try {
      const decodedToken: any = jwtDecode(this.token);
      return decodedToken?.roles || []; // Extract roles from the token
    } catch (error) {
      console.error('Error decoding token:', error);
      return [];
    }
  }

  /* Retrieve Roles from the Token */
  public getProfilePic(): string {
    if (!this.token) {
      return ""; // Default value if no token is present
    }

    try {
      const decodedToken: any = jwtDecode(this.token);
      return decodedToken?.profilePic || ""; // Extract roles from the token
    } catch (error) {
      console.error('Error decoding token:', error);
      return "";
    }
  }

  /* Retrieve Location from the Token */
  public getAuthenticatedLocation(): string | null {
    if (!this.token) {
      return null; // Return null if no token is present
    }

    try {
      const decodedToken: any = jwtDecode(this.token);
      return decodedToken?.location || null; // Extract location from the token
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /* Fetch the Seller Type for the Authenticated User */
  public async getAuthenticatedSellerType(): Promise<string | null> {
    if (!this.token) {
      return null;
    }

    try {
      const decodedToken: any = jwtDecode(this.token);

      // Make an HTTP call to fetch the seller type
      const response = await this.httpClient
        .get<{ sellerType: string }>(
          `${Config.apiBaseUrl}/seller/${decodedToken._id}`
        )
        .toPromise();

      return response?.sellerType || null; // Return the sellerType or null if not found
    } catch (error) {
      console.error('Error fetching sellerType:', error);
      return null;
    }
  }

  /* Authorize the Token with Server */
  public authorize(): Observable<boolean> {
    return this.httpClient
      .get<TokenResponseObject>(`${Config.apiBaseUrl}/security/authorize`)
      .pipe(
        map((response) => {
          this.token = response.token; // Update the token
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
              this.token = response.token; // Store the token on successful login
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
    this.token = ''; // Clear the token
    this.isAdminCached = null; // Reset cached role data
    this.isSellerCached = null;
    this.isBuyerCached = null;
    this.loggedIn.next(false); // Update logged-in state
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
              this.token = response.token; // Store the token
              this.loggedIn.next(true); // Set logged-in state to true
              this.fetchRoles(); // Fetch roles on registration

              // Conditional redirection based on role
              if (data.role === 'buyer') {
                this._router.navigate(['/questionnaire']); // Redirect buyers to the questionnaire page
              } else if (data.role === 'seller') {
                this._router.navigate(['/browse']); // Redirect sellers to the home page
              }

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
