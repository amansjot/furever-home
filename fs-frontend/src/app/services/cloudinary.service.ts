import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CloudinaryService {
  uploadImage(formData: FormData): Promise<any> {
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
}
