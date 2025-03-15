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
import { CloudinaryService } from '../../services/cloudinary.service';
import { ProfilePicService } from '../../services/profilepic.service';

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
    private itemService: ItemService, // Service to manage items (pets)
    private sellerService: SellerService, // Service to manage sellers
    private profilePicService: ProfilePicService
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
        
        // If profile is null (user not logged in), redirect to login page
        if (!data) {
          console.log('No profile data available - redirecting to login');
          // Redirect to login page after a short delay
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
        }
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
      if (result && result !== "") {
        // Update the profile picture with the result URL
        this.profile.profilePic = result;
        this.profilePicService.updateProfilePic(result);
        this.saveProfile();
      }
    });
  }

  saveProfile(): void {
    this.profileService
      .updateProfile(this.profile._id, this.profile)
      .subscribe({
        next: () => console.log('Profile updated successfully'), // Log success message
        error: (err) => console.error('Error updating profile:', err), // Log any errors
      });
  }
}
