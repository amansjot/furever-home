import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Config } from '../config';
import { UserModel } from '../models/users.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor(private httpClient: HttpClient) {}

  // New method to fetch the authenticated profile's profile
  public getProfileProfile() {
    return this.httpClient.get<UserModel>(`${Config.apiBaseUrl}/users/me`);
  }

  // Existing method (for reference)
  public getProfileById(id: string) {
    return this.httpClient.get<UserModel>(`${Config.apiBaseUrl}/users/${id}`);
  }
}
