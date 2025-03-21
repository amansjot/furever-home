import { Component } from '@angular/core';
import {
  MatDialogRef,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import imageCompression from 'browser-image-compression';
import { CloudinaryService } from '../../services/cloudinary.service';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-image-upload-dialog',
  standalone: true,
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, CommonModule, FormsModule,MatDialogModule],
  templateUrl: './image-upload-dialog.component.html',
  styleUrls: ['./image-upload-dialog.component.scss'],
})
export class ImageUploadDialogComponent {
  selectedFile: File | null = null;
  uploadedImageURL: string = '';
  preview: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<ImageUploadDialogComponent>,
    private cloudinaryService: CloudinaryService
  ) {}

  async onFileSelect(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
  
    if (input?.files && input.files[0]) {
      const file = input.files[0];
  
      // Check if the file is an image
      if (!file.type.startsWith('image/')) {
        console.warn('The selected file is not an image.');
        return;
      }
  
      let compressedFile = file; // Start with the original file
  
      // Optionally compress the image
      try {
        compressedFile = await imageCompression(file, {
          maxSizeMB: 1, // Maximum size in MB
          maxWidthOrHeight: 1024, // Resize to fit within this width/height
        });
  
        // Generate a preview for the UI
        const reader = new FileReader();
        reader.onload = () => {
          this.preview = reader.result as string; // Update preview image
        };
        reader.readAsDataURL(compressedFile);
  
        // Prepare the file for Cloudinary upload
        const formData = new FormData();
        formData.append('file', compressedFile);
  
        // Upload to Cloudinary
        const response = await this.cloudinaryService.uploadImage(formData);
        const imageUrl = response.secure_url;
        this.uploadedImageURL = imageUrl;
  
        console.log('Image uploaded successfully:', imageUrl);
  
        // Update the form control with the uploaded image URL
        // this.petForm.get('pictures')?.setValue([imageUrl]); // Only store 1 picture
        // this.selectedPictures = [imageUrl]; // Ensure only the current picture is stored
      } catch (error) {
        console.error('Error compressing or uploading the image:', error);
      }
  
      // Reset the input value
      input.value = '';
    }
  }
  

  // Optional: Function to clear the selected file and preview
  clearSelection(): void {
    this.selectedFile = null;
    this.uploadedImageURL = '';
    this.preview = null;
  }

  save(): void {
    this.dialogRef.close(this.uploadedImageURL);
  }
}


/*import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import imageCompression from 'browser-image-compression';
import { CloudinaryService } from '../../services/cloudinary.service';

@Component({
  selector: 'app-image-upload-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, CommonModule, FormsModule],
  templateUrl: './image-upload-dialog.component.html',

})
  
export class ImageUploadDialogComponent {
  selectedFile: File | null = null;
  preview: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<ImageUploadDialogComponent>,
    private cloudinaryService: CloudinaryService
  ) { }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files) {
      const formData = new FormData();
      this.selectedFile = input.files[0];
      
      formData.append('file', this.selectedFile);

      this.cloudinaryService
        .uploadImage(formData)
        .then((response) => {
          const imgURL = response.secure_url;
          this.selectedFile.push(imgUrl);
          this.profile.get('profilePic')?.setValue(this.selectedFile);
         
        })
        .catch((error) => {
          console.error('Error uploading image: ', error);
        });
      input.value = ''; 
    }
  }
  
  /*
export class ImageUploadDialogComponent {
  selectedFile: File | null = null;
  preview: string | null = null;

  constructor(public dialogRef: MatDialogRef<ImageUploadDialogComponent>) {}

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;

  if (input?.files && input.files[0]) {
    const file = input.files[0];

    const maxSize = 1 * 1024 * 1024; // 1MB chunks
    if (file.size > maxSize) {
      alert('File is too large, splitting into chunks...');
      const reader = new FileReader();

      reader.onload = () => {
        const text = reader.result as string;
        const chunks = [];

        for (let i = 0; i < text.length; i += maxSize) {
          chunks.push(text.slice(i, i + maxSize));
        }

        console.log('File chunks:', chunks); // Send chunks to the server
      }

      reader.readAsText(file);

      //this.enableSaveButton();
    }
  }
    /*const input = event.target as HTMLInputElement;

    if (input?.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();

      reader.onload = () => {
        // `reader.result` is a data URL (base64 string) in this case.
        this.preview = reader.result as string; // Set the preview image.
      };

      reader.readAsDataURL(this.selectedFile); // Convert file to data URL.
    }
  }*/

  // Optional: Function to clear the selected file and preview
 /* clearSelection(): void {
    this.selectedFile = null;
    this.preview = null;
  }

  save(): void {
    if (this.selectedFile && this.preview) {
      // Pass the Base64 image or file back to the parent component
      this.dialogRef.close(this.preview);
    }
  }
}*/

