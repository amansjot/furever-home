import { Component, Inject } from '@angular/core';
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

@Component({
  selector: 'app-image-upload-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, CommonModule, FormsModule],
  templateUrl: './image-upload-dialog.component.html',

})
/*
export class ImageUploadDialogComponent {
  selectedFile: File | null = null;
  preview: string | null = null;
  isSaveEnabled: boolean = false; // Add a flag to track if save is enabled

  constructor(public dialogRef: MatDialogRef<ImageUploadDialogComponent>) {}

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input?.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFile = file; // Update selectedFile

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

          // Enable save button after chunks are processed
          this.isSaveEnabled = true;
        };

        reader.readAsText(file);
      } else {
        // If the file is small, show a preview and enable the save button
        const reader = new FileReader();
        reader.onload = () => {
          this.preview = reader.result as string; // Set the preview (Base64)
          this.isSaveEnabled = true; // Enable save button
        };
        reader.readAsDataURL(file); // Read as Base64 for image/file preview
      }
    }
  }

  // Optional: Function to clear the selected file and preview
  clearSelection(): void {
    this.selectedFile = null;
    this.preview = null;
    this.isSaveEnabled = false; // Disable save button when no file is selected
  }

  save(): void {
    if (this.selectedFile && this.preview) {
      // Pass the Base64 image or file back to the parent component
      this.dialogRef.close(this.preview);
    }
  }
}
*/
  
export class ImageUploadDialogComponent {
  selectedFile: File | null = null;
  preview: string | null = null;

  constructor(public dialogRef: MatDialogRef<ImageUploadDialogComponent>) {}

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        /*if (!this.selectedFile.includes(reader.result as string)) {
          this.selectedFile.push(reader.result as string);
        }*/
        this.preview = reader.result as string;
      };

      reader.readAsDataURL(this.selectedFile);
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
  clearSelection(): void {
    this.selectedFile = null;
    this.preview = null;
  }

  save(): void {
    if (this.selectedFile && this.preview) {
      // Pass the Base64 image or file back to the parent component
      this.dialogRef.close(this.preview);
    }
  }
}

