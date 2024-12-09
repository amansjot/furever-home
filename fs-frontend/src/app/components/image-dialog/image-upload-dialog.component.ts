import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
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
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, CommonModule, FormsModule, MatDialogModule],
  templateUrl: './image-upload-dialog.component.html',
})
export class ImageUploadDialogComponent {
  selectedFile: File | null = null;
  preview: string | null = null;
  public loading: boolean = false;
  profile: any;

  constructor(
    public dialogRef: MatDialogRef<ImageUploadDialogComponent>,
    private cloudinaryService: CloudinaryService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  // Load the authenticated user's profile to retrieve their ID
  loadUserProfile(): void {
    this.cloudinaryService.getAuthProfile().subscribe({
      next: (data) => {
        this.loading = false;
        this.profile = data; // Assuming `_id` is the user ID field in your UserModel
      },
      error: (err) => {
        this.loading = false;
        console.error('Error loading user profile:', err);
      },
    });
  }

  async onFileSelect(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input?.files && input.files[0]) {
      this.selectedFile = input.files[0];

      try {
        // Compress the image
        const compressedFile = await imageCompression(this.selectedFile, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
        });
        this.selectedFile = compressedFile;

        // Generate a preview
        const reader = new FileReader();
        reader.onload = () => {
          this.preview = reader.result as string;
        };
        reader.readAsDataURL(this.selectedFile);

        // Upload the image and update the profile
        if (this.profile) {
          this.loading = true;
          const formData = new FormData();
          formData.append('file', this.selectedFile);

          try {
            // Use the combined upload-and-save method from CloudinaryService
            await this.cloudinaryService.uploadAndSaveProfilePicture(this.profile, formData);
            console.log('Profile picture uploaded and saved successfully.');

            // Close the dialog with the updated profile picture URL
            this.dialogRef.close('Image uploaded successfully!');
          } catch (error) {
            console.error('Error uploading and saving profile picture:', error);
          } finally {
            this.loading = false;
          }
        } else {
          console.error('User ID is not available.');
        }
      } catch (error) {
        console.error('Error compressing the image:', error);
      }

      // Reset the file input
      input.value = '';
    }
  }

  // Clear the selected file and preview
  clearSelection(): void {
    this.selectedFile = null;
    this.preview = null;
  }

  // Save button handler (optional, based on your UI)
  save(): void {
    if (this.preview) {
      this.dialogRef.close(this.preview);
    }
  }
}


/*import { Component } from '@angular/core';
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
})
export class ImageUploadDialogComponent {
  selectedFile: File | null = null;
  preview: string | null = null;
  public submitted = false;
  public loading: boolean = true;
  profile: any;

  constructor(
    public dialogRef: MatDialogRef<ImageUploadDialogComponent>,
    private cloudinaryService: CloudinaryService
  ) {}

  ngOnInit(): void{
    this.loadProfile();
  }

  public userId = this.cloudinaryService.getAuthProfile();

  loadProfile(): void {
    this.cloudinaryService.getAuthProfileById().subscribe({
      next: (data) => {
        this.
      }
    });
  }


  async onFileSelect(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input?.files && input.files[0]) {
      this.selectedFile = input.files[0];

      // Optionally compress the image
      try {
        const compressedFile = await imageCompression(this.selectedFile, {
          maxSizeMB: 1, // Maximum size in MB
          maxWidthOrHeight: 1024, // Resize to fit within this width/height
        });
        this.selectedFile = compressedFile;

        // Generate a preview
        const reader = new FileReader();
        reader.onload = () => {
          this.preview = reader.result as string;
        };
        reader.readAsDataURL(this.selectedFile);

        // Upload to the cloud service
        const formData = new FormData();
        formData.append('file', this.selectedFile);

        this.cloudinaryService
          .uploadImage(formData)
          .update
          .then((response) => {
          console.log('Image uploaded successfully:', response);
          const imageUrl = response.secure_url;

          // Pass the image URL back to the parent component
          
          //this.dialogRef.close(imageUrl);
          
        }).catch((error) => {
          console.error('Error uploading image:', error);
        });
      } catch (error) {
        console.error('Error compressing the image:', error);
      }

      // Reset the input value
      input.value = '';
    }
  }


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

*/
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

