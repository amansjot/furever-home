import { Injectable } from '@angular/core';
import { Cloudinary } from '@cloudinary/angular';

@Injectable({
  providedIn: 'root',
})
export class CloudinaryService {
  private cloudinary: Cloudinary;

  constructor() {
    this.cloudinary = new Cloudinary({
      cloudName: 'dnnvvg279',
      apiKey: '154123633377178',
      apiSecret: 'Pqon2RL3bB_-KocKhEs4YcxGlkU',
    });
  }

  public uploadImage(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    // formData.append('upload_preset', 'your-upload-preset');

    return fetch(`https://api.cloudinary.com/v1_1/dnnvvg279/image/upload`, {
      method: 'POST',
      body: formData,
    }).then((response) => response.json());
  }
}
