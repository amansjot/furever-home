import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Config } from '../config';
import { UserModel } from '../models/users.model';
import { Observable, catchError, of } from 'rxjs';

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
          console.error('Error fetching all users:', err);
          reject(err);
        },
      });
    });
  }

  // Method to fetch the authenticated profile
  public getProfile(): Observable<UserModel | null> {
    return this.httpClient.get<UserModel>(`${Config.apiBaseUrl}/users/me`)
      .pipe(
        catchError((error) => {
          console.error('Error fetching profile:', error);
          return of(null); // Return null on error
        })
      );
  }

  // Method to fetch profile by ID
  public getProfileById(id: string): Observable<UserModel> {
    return this.httpClient.get<UserModel>(`${Config.apiBaseUrl}/users/${id}`)
      .pipe(
        catchError((error) => {
          console.error(`Error fetching profile with ID ${id}:`, error);
          throw error; // Rethrow the error to be handled by the subscriber
        })
      );
  }

  // New method to update the authenticated profile
  public updateProfile(id: string, profileData: Partial<UserModel>): Observable<any> {
    return this.httpClient.put(`${Config.apiBaseUrl}/users/${id}`, profileData)
      .pipe(
        catchError((error) => {
          console.error(`Error updating profile with ID ${id}:`, error);
          throw error; // Rethrow the error to be handled by the subscriber
        })
      );
  }
}
