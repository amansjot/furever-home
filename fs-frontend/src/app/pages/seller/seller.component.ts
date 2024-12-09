import { Component, HostListener, OnInit } from '@angular/core';
import { SellerService } from '../../services/seller.service';
import { ItemService } from '../../services/item.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterModule,
} from '@angular/router';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { AlertDialogComponent } from '../../components/alert-dialog/alert-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { LoginService } from '../../services/login.service';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { ProfileService } from '../../services/profile.service';
import { firstValueFrom } from 'rxjs';
import { UserModel } from '../../models/users.model';

@Component({
  selector: 'app-seller',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    RouterLink,
    RouterModule,
    MatTabsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatSortModule,
  ],
  templateUrl: './seller.component.html',
  styleUrls: ['./seller.component.scss'],
})
export class SellerComponent implements OnInit {
  public rootSellerRoute: string = '';
  public loading: boolean = true;
  public disableLogin: boolean = false;
  public authenticated: boolean = false;
  public isButtonVisible = window.innerWidth < 1024;
  public isGridView: boolean = false;
  public itemStatuses: { [key: string]: string } = {}; // Tracks statuses for items by ID

  public requestsColumns: string[] = [
    'petId',
    'userId',
    'timestamp',
    'actions',
  ];
  public requests = new MatTableDataSource<Object>([]);

  seller: any;
  pets: any[] = [];
  userInfo: { [key: string]: string } = {};
  userEmails: { [key: string]: string } = {};
  petInfo: { [key: string]: string } = {};

  constructor(
    private route: ActivatedRoute,
    private _loginSvc: LoginService,
    private sellerService: SellerService,
    private itemService: ItemService,
    private profileService: ProfileService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadSeller();
  }

  loadSeller(): void {
    this.sellerService.getSellerProfile().subscribe({
      next: (data) => {
        this.rootSellerRoute = this.route.snapshot.url.toString();
        this.loading = false;
        this.seller = data;
        this.requests.data = this.seller.requests;
        this.loadUserInfo(this.requests.data);
        this.loadPetInfo(this.requests.data);
        this.loadPets();
      },
      error: (err) => {
        this.loading = false;
        console.error('Error loading seller:', err);
      },
    });
  }

  loadPets(): void {
    if (this.seller.pets && this.seller.pets.length) {
      this.seller.pets.forEach((petId: string) => {
        this.itemService.getItemById(petId).then(
          (pet) => this.pets.push(pet),
          (err) => console.error('Error loading pet:', err)
        );
      });
    }
  }

  loadUserInfo(requests: any[]): void {
    requests.forEach((request) => {
      const userId = request.userId;
      if (!this.userInfo[userId]) {
        this.profileService.getProfileById(userId).subscribe({
          next: (profile: UserModel) => {
            console.log(profile);
            this.userInfo[
              userId
            ] = `${profile.firstName} ${profile.lastName} (${profile.username})`;
            this.userEmails[userId] = profile.username;
          },
          error: (err: any) => {
            console.error(err);
            this.userInfo[userId] = 'Unknown User';
          },
        });
      }
    });
  }

  async loadPetInfo(requests: any[]): Promise<void> {
    for (const request of requests) {
      const petId = request.petId;
      if (!this.userInfo[petId]) {
        try {
          const pet = await this.itemService.getItemById(petId);
          console.log(pet);
          this.petInfo[petId] = pet.name;
        } catch (err) {
          console.error(err);
          this.petInfo[petId] = 'Unknown Pet';
        }
      }
    }
  }

  getPetById(petId: string): string {
    return '';
  }

  async getUserById(userId: string): Promise<string> {
    try {
      const profile: any = await firstValueFrom(
        this.profileService.getProfileById(userId)
      );
      console.log(profile);
      return `${profile.firstName} ${profile.lastName} (${profile.username})`;
    } catch (err: any) {
      console.error(err);
      return '';
    }
  }

  toggleGridView(): void {
    this.isGridView = !this.isGridView;
    // Reset expanded cards when toggling view
    this.expandedCards = {};
  }

  // Track the expanded state of each card using the pet's name as the key
  public expandedCards: { [key: string]: boolean } = {};

  getAge(birthdate: Date | null): number {
    if (!birthdate) {
      return -1;
    }

    const now = new Date();
    const birth = new Date(birthdate);

    const diffInMilliseconds = now.getTime() - birth.getTime();
    const ageInYears = diffInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);

    return ageInYears;
  }

  formatAge(ageInYears: number): string {
    if (ageInYears < 1) {
      // Convert to months if less than 1 year
      const months = Math.round(ageInYears * 12);
      if (months < 3) {
        // Convert to weeks if less than 3 months
        const weeks = Math.round(months * 4.345); // Approximate weeks in a month
        return `${weeks} week${weeks !== 1 ? 's' : ''}`;
      }
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else {
      // Display in years if 1 year or more
      ageInYears = Math.floor(ageInYears);
      return `${ageInYears} year${ageInYears !== 1 ? 's' : ''}`;
    }
  }

  navigateToPetDesktop(event: MouseEvent, petId: string): void {
    const targetElement = event.target as HTMLElement;

    // Check if the clicked element or its parent has `data-ignore-click`
    if (
      targetElement.getAttribute('data-ignore-click') === 'true' ||
      targetElement.closest('[data-ignore-click="true"]')
    ) {
      return;
    }

    if (!this.isButtonVisible) {
      localStorage.setItem('petHistoryStart', 'seller');
      this.router.navigate([`/pet/${petId}`]);
    }
  }

  navigateToPetMobile(petId: string): void {
    localStorage.setItem('petHistoryStart', 'seller');
    this.router.navigate([`/pet/${petId}`]);
  }

  // Listen for window resize events to adjust button visibility
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    const width = (event.target as Window).innerWidth;
    this.isButtonVisible = width < 1024;
  }

  // Toggle the expanded state of a card
  toggleCard(name: string) {
    this.expandedCards[name] = !this.expandedCards[name];
  }

  editItem(event: MouseEvent, itemId: string): void {
    event.stopPropagation();
    this.router.navigate(['/pet/edit', itemId]);
  }

  messageBuyer(request: any) {
    window.open('mailto:' + this.userEmails[request.userId]);
  }

  confirmDenyRequest(request: Object): void {
    // Open the confirmation dialog
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        action: 'Deny Request',
        message:
          'Are you sure you want to deny this request? This cannot be undone.',
      },
      width: '400px',
    });

    // Handle the user's confirmation
    dialogRef.afterClosed().subscribe((isConfirmed) => {
      if (isConfirmed) {
        this.closeRequest(request);
      }
    });
  }

  closeRequest(request: any) {
    // Remove the request from the data source
    const index = this.requests.data.findIndex(
      (r: any) => r.userId === request.userId && r.petId === request.petId
    );

    if (index > -1) {
      this.requests.data.splice(index, 1); // Remove the request from the array
      this.requests._updateChangeSubscription(); // Notify the table of the data change
    }

    const sellerId = this._loginSvc.getAuthenticatedUserId();
    if (sellerId) {
      this.sellerService
        .closeRequest(sellerId, request.userId, request.petId)
        .subscribe({
          next: () => {
            console.log(`Request successfully denied for pet ${request.petId}`);
          },
          error: (err: any) => {
            console.error('Failed to deny request:', err);
          },
        });
    }
  }

  confirmDelete(event: MouseEvent, itemId: string): void {
    event.stopPropagation();

    // Open the confirmation dialog
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        action: 'Remove Pet',
        message:
          'Are you sure you want to permanently remove this pet? This cannot be undone.',
      },
      width: '400px',
    });

    // Handle the user's confirmation
    dialogRef.afterClosed().subscribe((isConfirmed) => {
      if (isConfirmed) {
        this.deleteItem(itemId);
      }
    });
  }

  confirmAcceptRequest(request: any) {
    // Open the confirmation dialog
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        action: 'Accept',
        message: 'Are you sure you want to accept this request?',
      },
      width: '400px',
    });

    // Handle the user's confirmation
    dialogRef.afterClosed().subscribe((isConfirmed) => {
      if (isConfirmed) {
        this.setAdopted(request.petId, false);
        this.closeRequest(request);

        // Open the confirmation dialog
        this.dialog.open(AlertDialogComponent, {
          data: {
            title: `Message the New Owner`,
            message:
              'Congrats! Send a message to the owner of your pet: ' + this.userEmails[request.userId],
          },
          width: '400px',
        });
      }
    });
  }

  confirmAdopted(
    event: MouseEvent,
    itemId: string,
    alreadyAdopted: boolean
  ): void {
    event.stopPropagation();

    if (alreadyAdopted) {
      this.setAdopted(itemId, alreadyAdopted);
      return;
    }

    // Open the confirmation dialog
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        action: 'Confirm',
        message:
          'Are you sure you want to mark this pet as adopted? This can be undone.',
      },
      width: '400px',
    });

    // Handle the user's confirmation
    dialogRef.afterClosed().subscribe((isConfirmed) => {
      if (isConfirmed) {
        this.setAdopted(itemId, alreadyAdopted);
      }
    });
  }

  async setAdopted(itemId: string, alreadyAdopted: boolean) {
    let status = '';
    if (alreadyAdopted) {
      const sellerType = await this._loginSvc.getAuthenticatedSellerType();
      switch (sellerType) {
        case 'shelter':
          status = 'Sheltered';
          break;
        case 'breeder':
          status = 'Bred';
          break;
        case 'rehoming':
          status = 'Rehoming';
          break;
      }
    } else {
      status = 'Unavailable';
    }

    this.itemService.setItemStatus(itemId, status).subscribe({
      next: () => {
        this.itemStatuses[itemId] = status.toLowerCase();
        console.log("Item's adoption status changed!");
      },
      error: (err: any) => {
        console.error("Error changing item's adoption status:", err);
      },
    });
  }

  getItemStatus(item: any): string {
    return this.itemStatuses[item._id] || item.status.toLowerCase();
  }

  deleteItem(itemId: string): void {
    this.itemService.deleteItemById(itemId).subscribe({
      next: () => {
        this.pets = this.pets.filter((pet) => pet._id !== itemId); // Remove item from local array
        console.log('Item deleted successfully');
      },
      error: (err: any) => {
        console.error('Error deleting item:', err);
      },
    });
  }
}
