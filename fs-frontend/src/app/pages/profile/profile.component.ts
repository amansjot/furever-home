import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../services/profile.service';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EditDialogComponent } from '../../components/edit-dialog/edit-dialog.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatDialogModule,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  public loading: boolean = true;
  profile: any;

  constructor(
    private profileService: ProfileService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (data) => {
        this.loading = false;
        this.profile = data;
      },
      error: (err) => {
        this.loading = false;
        console.error('Error loading profile:', err);
      },
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

  saveProfile(): void {
    this.profileService
      .updateProfile(this.profile._id, this.profile)
      .subscribe({
        next: () => console.log('Profile updated successfully'),
        error: (err) => console.error('Error updating profile:', err),
      });
  }
}
