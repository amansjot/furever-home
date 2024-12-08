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
import { ItemService } from '../../services/item.service';
import { SellerService } from '../../services/seller.service';

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
  public profileForm!: FormGroup;
  public selectedPictures: string[] = [];
  public submitted = false;
  public loading: boolean = true; // Tracks if profile data is being loaded
  profile: any; // Stores the profile data of the user

  constructor(
    private profileService: ProfileService,// Service to manage user profiles
    private dialog: MatDialog, // Service to handle dialogs
    private router: Router,
    private itemService: ItemService, // Service to manage items (pets)
    private sellerService: SellerService // Service to manage sellers
  ) {}

  // Initialize the component and load the profile data
  ngOnInit(): void {
    this.loadProfile();
    //this.initForm();
  }

  // Fetch the profile data from the server
  loadProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (data) => {
        this.loading = false; // Set loading to false when data is loaded
        this.profile = data; // Assign the fetched data to the profile property
      },
      error: (err) => {
        this.loading = false; // Set loading to false in case of an error
        console.error('Error loading profile:', err); // Log any errors
      },
    });
  }

  // Open a dialog to change a field in the profile
  changeField(field: string, secondaryField?: string): void {
    let description = '';

    // Add a note if the field being updated is location for a seller
    if (field === 'location' && this.profile.roles.includes('seller')) {
      description = 'Note: This will update all of your pets\' locations!';
    }

    // Open the edit dialog
    const dialogRef = this.dialog.open(EditDialogComponent, {
      data: {
        fields: secondaryField ? [field, secondaryField] : [field], // Fields to be edited
        values: secondaryField
          ? [this.profile[field], this.profile[secondaryField]] // Current values of the fields
          : [this.profile[field]],
        description, // Optional description to display in the dialog
      },
    });

    // Handle the result of the dialog
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (secondaryField) {
          // If multiple fields are updated
          this.profile[field] = result[0]; // Update the primary field
          this.profile[secondaryField] = result[1]; // Update the secondary field
        } else {
          // Single field update
          const valueChanged = this.profile[field] !== result[0]; // Check if the value has changed
          this.profile[field] = result[0];

          // If the location field is updated and its value has changed
          if (field === 'location' && valueChanged) {
            if (this.profile.roles.includes('seller')) {
              this.sellerService.getSellerById(this.profile._id).subscribe({
                next: (sellerProfile) => {
                  if (sellerProfile && sellerProfile.pets) {
                    const pets: Object[] = sellerProfile.pets; // Get the pets of the seller

                    // Update the locations of the pets
                    this.itemService
                      .updatePetLocations(pets, result[0])
                      .subscribe({
                        next: () =>
                          console.log(
                            'Pet locations successfully updated to match.'
                          ),
                        error: (err) =>
                          console.error('Error updating profile:', err),
                      });
                  } else {
                    console.warn('Seller profile does not contain pets.'); // Log warning if no pets are found
                  }
                },
                error: (err) => {
                  console.error('Error fetching seller profile:', err); // Log any errors while fetching the seller profile
                },
              });
            }
          }
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
        next: () => console.log('Profile updated successfully'), // Log success message
        error: (err) => console.error('Error updating profile:', err), // Log any errors
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
