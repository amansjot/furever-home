import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../services/profile.service';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EditDialogComponent } from '../../components/edit-dialog/edit-dialog.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ImageUploadDialogComponent } from '../../components/image-dialog/image-upload-dialog.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatDialogModule,
    ReactiveFormsModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  profile: any;
  public profileForm!: FormGroup;
  public selectedPictures: string[] = [];
  public submitted = false;
  constructor(
    private profileService: ProfileService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProfile();
    //this.initForm();
  }

  loadProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (data) => {
        this.profile = data;
      },
      error: (err) => console.error('Error loading profile:', err),
    });
  }

  changeField(field: string, secondaryField?: string): void {
    const dialogRef = this.dialog.open(EditDialogComponent, {
      data: {
        fields: secondaryField ? [field, secondaryField] : [field],
        values: secondaryField
          ? [this.profile[field], this.profile[secondaryField]]
          : [this.profile[field]],
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (secondaryField) {
          // If multiple fields are updated
          this.profile[field] = result[0];
          this.profile[secondaryField] = result[1];
        } else {
          // Single field update
          this.profile[field] = result[0];
        }
        this.saveProfile(); // Save the updated profile to the server
      }
    });
  }

  openImageUploadDialog(): void {
    const dialogRef = this.dialog.open(ImageUploadDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Update the profile picture with the result (Base64 string)
        this.profile.profilePic = result;
        this.saveProfile();
      }
    });
  }


  saveProfile(): void {
    this.profileService
      .updateProfile(this.profile._id, this.profile, this.profile.profilePic)
      .subscribe({
        next: () => console.log('Profile updated successfully'),
        error: (err) => console.error('Error updating profile:', err),
      });
  }
/*
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files) {
      Array.from(input.files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (!this.selectedPictures.includes(reader.result as string)) {
            // Only add the file if it's not already in the selectedPictures array
            this.selectedPictures.push(reader.result as string);
            this.profileForm.get('pictures')?.setValue(this.selectedPictures); // Update the form control
            this.profileForm.get('pictures')?.updateValueAndValidity(); // Trigger validation
          }
        };
        reader.readAsDataURL(file);
      });

      // Reset the file input value to allow re-uploading the same file
      input.value = '';
    }
  }
  /*
  async onSubmit(): Promise<void> {
    this.submitted = true;

    if (this.profileForm.invalid) return;*/
/*
  private initForm() {
    this.profileForm = new FormGroup({
      profilePic: new FormControl([], Validators.required)
    });
    }
  
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files && input.files.length) {
      const file = input.files[0];
        const reader = new FileReader();
        reader.onload = () => {
          this.selectedPictures.push(reader.result as string);
          this.profileForm.get(this.profile.profilePic)?.setValue(this.selectedPictures);
          this.profileForm.get(this.profile.profilePic)?.updateValueAndValidity();
        };
      reader.readAsDataURL(file);
      console.log("file selected");
      //input.value = "";
    }
    
    }

  async onSubmit(): Promise<void> {
    console.log("file selected");
    this.submitted = true;
  
    console.log("file atempt to submit");
    if (this.profileForm.invalid) return;
    console.log("file submitting");
    const formData = {
      ...this.profile,
     profilePic: this.selectedPictures[0], // Assuming one profile picture
    };
  
    this.profileService.updateProfile(this.profile._id, this.profile, formData).subscribe({
      next: () => console.log('Profile picture updated successfully!'),
      error: (err) => console.error('Error updating profile picture:', err),
    });

  }*/
  
  /*
  async onSubmit(): Promise<void> {
    this.submitted = true;
    
    if (this.profileForm.invalid) return;

    const formData = {
      ...this.profileForm.value,
    };


  }
  */
  
  /*
    onFileSelect(event: Event): void {
      const input = event.target as HTMLInputElement;
      if (input?.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();
    
        // Preview the selected image
        reader.onload = () => {
          this.profile.profilePic = reader.result as string;
        };
        reader.readAsDataURL(file);
    
        // Store the file for submission
        this.profileForm.get('profilePic')?.setValue(file);
      }
    }*/
    
}
