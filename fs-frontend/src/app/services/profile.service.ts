import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Config } from '../config';
import { UserModel } from '../models/users.model';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor(private httpClient: HttpClient) {}

  // Method to get all user data
  public getAllUsers(): Promise<UserModel[]> {
    return new Promise<UserModel[]>((resolve, reject) => {
      this.httpClient.get<UserModel[]>(`${Config.apiBaseUrl}/users`).subscribe({
        next: (data) => {
          resolve(data);
        },
        error: (err) => {
          reject(err);
        },
      });
    });
  }

  // Method to fetch the authenticated profile
  public getProfile(): Observable<UserModel | null> {
    return this.httpClient.get<UserModel>(`${Config.apiBaseUrl}/users/me`).pipe(
      catchError(error => {
        // If it's a 401 error, it means the user is not logged in yet
        // Just return null instead of throwing an error
        if (error.status === 401) {
          
          return of(null);
        }
        // For other errors, log them but still return null to prevent app crashes
        console.error('Error fetching profile:', error);
        return of(null);
      })
    );
  }

  // Method to fetch profile by ID
  public getProfileById(id: string): Observable<UserModel> {
    return this.httpClient.get<UserModel>(`${Config.apiBaseUrl}/users/${id}`);
  }

  // New method to update the authenticated profile
  public updateProfile(id: string, profileData: Partial<UserModel>): Observable<any> {
    return this.httpClient.put(`${Config.apiBaseUrl}/users/${id}`, profileData);
  }
}
