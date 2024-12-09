import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Config } from '../config';
import { UserModel } from '../models/users.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CloudinaryService {
  constructor(private httpClient: HttpClient) {}

  // Method to upload an image to Cloudinary
  public async uploadImage(formData: FormData): Promise<any> {
    const cloudName = 'dnnvvg279'; // Your Cloudinary cloud name
    const uploadPreset = 'ml_default'; // Replace with your unsigned preset name
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    formData.append('upload_preset', uploadPreset);

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image to Cloudinary');
    }

    const result = await response.json();
    return result; // Contains Cloudinary response, including URL
  }

  // Method to update profile picture with Cloudinary URL
  public updateProfilePicture(userId: string, profilePicUrl: string): Observable<any> {
    return this.httpClient.put(`${Config.apiBaseUrl}/users/${userId}`, {
      profilePic: profilePicUrl, // Assuming `profilePic` is the field in your UserModel schema
    });
  }

  // Combine upload and update
  public async uploadAndSaveProfilePicture(userId: string, formData: FormData): Promise<any> {
    try {
      // Upload the image to Cloudinary
      const uploadResult = await this.uploadImage(formData);

      // Get the URL from the Cloudinary response
      const imageUrl = uploadResult.secure_url;

      if (!imageUrl) {
        throw new Error('Failed to retrieve image URL from Cloudinary response');
      }

      // Save the image URL to MongoDB
      return this.updateProfilePicture(userId, imageUrl).toPromise();
    } catch (error) {
      console.error('Error during image upload and save:', error);
      throw error;
    }
  }

  // Method to fetch the authenticated user's profile
  public getAuthProfile(): Observable<UserModel> {
    return this.httpClient.get<UserModel>(`${Config.apiBaseUrl}/users/me`);
  }

  // Method to fetch a user's profile by ID
  public getAuthProfileById(id: string): Observable<UserModel> {
    return this.httpClient.get<UserModel>(`${Config.apiBaseUrl}/users/${id}`);
  }
}

/*import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Config } from '../config';
import { UserModel } from '../models/users.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CloudinaryService {
  constructor(private httpClient: HttpClient) { }

  public uploadImage(formData: FormData): Promise<any> {
    const cloudName = 'dnnvvg279'; // Your Cloudinary cloud name
    const uploadPreset = 'ml_default'; // Replace with your unsigned preset name
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    // Ensure the unsigned upload preset is included in the form data
    formData.append('upload_preset', uploadPreset);

    return fetch(url, {
      method: 'POST',
      body: formData,
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Failed to upload image to Cloudinary');
      }
      return response.json();
    });
  }

}*/
