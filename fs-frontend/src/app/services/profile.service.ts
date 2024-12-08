import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Config } from '../config';
import { UserModel } from '../models/users.model';
import { Observable } from 'rxjs';

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
  public getProfile(): Observable<UserModel> {
    return this.httpClient.get<UserModel>(`${Config.apiBaseUrl}/users/me`);
  }

  // Method to fetch profile by ID
  public getProfileById(id: string): Observable<UserModel> {
    return this.httpClient.get<UserModel>(`${Config.apiBaseUrl}/users/${id}`);
  }

  // New method to update the authenticated profile
  public updateProfile(id: string, profileData: Partial<UserModel>, profilePic: string): Observable<any> {
    return this.httpClient.put(`${Config.apiBaseUrl}/users/${id}`, profileData);
  }
}
