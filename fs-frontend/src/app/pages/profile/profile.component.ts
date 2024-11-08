import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  profile: any;
  pets: any[] = [];

  constructor(
    private profileService: ProfileService,
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.profileService.getProfileProfile().subscribe({
      next: (data) => {
        this.profile = data;
      },
      error: (err) => console.error('Error loading profile:', err),
    });
  }
}
