import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemService } from '../../services/item.service';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ContactDialogComponent } from '../../components/contact-dialog/contact-dialog.component';
import { LoginService } from '../../services/login.service';
import { of, delay, switchMap, forkJoin, catchError } from 'rxjs';
import { SellerService } from '../../services/seller.service';
import { SellerModel } from '../../models/seller.model';
import { BuyerService } from '../../services/buyer.service';
import { InventoryItemModel } from '../../models/items.model';
import { RouterModule } from '@angular/router';

interface SimilarPet extends InventoryItemModel {
  similarityScore: number;
}

interface BreadcrumbItem {
  name: string;
  id: string;
}

@Component({
  selector: 'app-pet',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pet.component.html',
  styleUrls: ['./pet.component.scss'],
})
export class PetComponent implements OnInit {
  public loading: boolean = true;
  public disableLogin: boolean = false;
  public authenticated: boolean = false;
  public isBuyer: boolean = false;
  public favorites: string[] = [];

  public contactInfo: SellerModel | null = null;

  pet: any;
  currentImageIndex: number = 0;
  isModalOpen: boolean = false; // Track modal state
  similarPets: SimilarPet[] = [];
  breadcrumbHistory: BreadcrumbItem[] = [];
  petHistoryStart: string = 'browse';
  maxHistory = 4; // Maximum number of pets in history

  constructor(
    private route: ActivatedRoute,
    private itemService: ItemService,
    private _loginSvc: LoginService,
    private buyerService: BuyerService,
    private sellerService: SellerService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Subscribe to login changes to update the buyer status dynamically
    this._loginSvc.loggedIn.subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        this._loginSvc.loggedIn.subscribe(this.onLoginChange);
      } else {
        this.isBuyer = false;
      }
    });

    this.favorites = JSON.parse(localStorage.getItem('favorites') || '');
    this.loadFavorites();

    // Load history from localStorage
    const savedHistory = localStorage.getItem('petHistory');
    if (savedHistory) {
      this.breadcrumbHistory = JSON.parse(savedHistory);
    }

    // Load history start
    this.petHistoryStart = localStorage.getItem('petHistoryStart') || "browse";

    // Subscribe to route changes
    this.route.params.subscribe((params) => {
      const petId = params['id'];
      if (petId) {
        // If we're navigating back to a pet in history, trim the history
        const petIndex = this.breadcrumbHistory.findIndex(
          (item) => item.id === petId
        );
        if (petIndex !== -1) {
          this.breadcrumbHistory = this.breadcrumbHistory.slice(0, petIndex);
          localStorage.setItem(
            'petHistory',
            JSON.stringify(this.breadcrumbHistory)
          );
        }

        // Load the current pet
        this.itemService.getItemById(petId).then(
          (pet) => {
            this.pet = pet;
            this.loading = false;
            this.loadSimilarPets();
          },
          (error) => {
            this.loading = false;
            console.error('Error fetching pet details:', error);
          }
        );
      }
    });
  }

  loadFavorites(): void {
    this.buyerService.getFavorites().subscribe({
      next: (data) => {
        this.favorites = data;

        // Perform an initial check to see if the pet is favorited
        if (this.pet && this.pet._id) {
          this.pet.isFavorite = this.favorites.includes(this.pet._id); // Update the `isFavorite` property
        }
      },
      error: (err) => {
        this.favorites = JSON.parse(localStorage.getItem('favorites') || '');
        console.log('Error loading favorites:', err);
      },
    });
  }

  // Toggle the favorite status of a card
  toggleFavorite(event: MouseEvent, item: InventoryItemModel): void {
    event.stopPropagation();

    item.isFavorite = !item.isFavorite; // Toggle the favorite status

    if (item.isFavorite) {
      const target = (event.currentTarget as HTMLElement).querySelector('img');
      if (target) {
        // Add the 'pulse' class
        target.classList.add('pulse');

        // Remove the class after the animation ends
        setTimeout(() => {
          target.classList.remove('pulse');
        }, 300); // Match the duration of the animation (0.3s in CSS)
      }
    }

    this.updateFavoriteStatus(item);
  }

  updateFavoriteStatus(item: InventoryItemModel): void {
    if (item.isFavorite) {
      // Add to favorites if marked as favorite
      this.favorites.push(item._id);
    } else {
      // Remove from favorites if unmarked
      const index = this.favorites.indexOf(item._id);
      if (index > -1) this.favorites.splice(index, 1);
    }

    localStorage.setItem('favorites', JSON.stringify(this.favorites));

    // Send to the database
    this.buyerService.updateFavorites(this.favorites).subscribe({
      next: () => console.log('Favorites updated successfully'),
      error: (err) => console.error('Error updating favorites:', err),
    });
  }

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

  nextImage(): void {
    if (this.pet.pictures && this.pet.pictures.length) {
      this.currentImageIndex =
        (this.currentImageIndex + 1) % this.pet.pictures.length;
    }
  }

  prevImage(): void {
    if (this.pet.pictures && this.pet.pictures.length) {
      this.currentImageIndex =
        (this.currentImageIndex - 1 + this.pet.pictures.length) %
        this.pet.pictures.length;
    }
  }

  goToImage(index: number): void {
    if (this.pet.pictures && index >= 0 && index < this.pet.pictures.length) {
      this.currentImageIndex = index;
    }
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  requestContact() {
    const userId = this._loginSvc.getAuthenticatedUserId(); // Retrieve the current user's ID

    if (!userId) {
      console.error('User ID is missing. Please ensure the user is logged in.');
      return;
    }

    // Fetch the seller's contact info, which includes the sellerId
    this.sellerService.getSellerByPetId(this.pet._id).subscribe({
      next: (info) => {
        const sellerId = info._id;

        if (!sellerId) {
          console.error(
            'Seller ID is missing in the fetched contact info:',
            info
          );
          alert('Unable to identify the seller. Please try again later.');
          return;
        }

        // Check if the authenticated user's ID is already in the Seller's requests array
        if (info.requests && info.requests.includes(userId)) {
          // Open the dialog immediately without adding a new request
          this.dialog.open(ContactDialogComponent, {
            data: {
              ...info, // Spread the existing info data
              alreadyRequested: true, // Add the alreadyRequested flag
            },
            width: '500px',
            maxWidth: '90vw',
            panelClass: 'contact-dialog',
          });
          this.contactInfo = info;
          return;
        }

        // Add the user's ID to the seller's "requests" array
        this.sellerService.addRequestToSeller(sellerId, userId).subscribe({
          next: () => {
            // Open the dialog with the retrieved contact information
            this.dialog.open(ContactDialogComponent, {
              data: {
                ...info, // Spread the existing info data
                alreadyRequested: false, // Add the alreadyRequested flag
              },
              width: '500px',
              maxWidth: '90vw',
              panelClass: 'contact-dialog',
            });
            this.contactInfo = info;
          },
          error: (err) => {
            console.error('Error adding request to seller:', err);
            alert('Could not add request to seller.');
          },
        });
      },
      error: (err) => {
        console.error('Error fetching seller contact:', err);
        alert('Could not fetch seller contact information.');
      },
    });
  }

  onLoginChange = (loggedIn: boolean) => {
    this.authenticated = loggedIn;

    if (loggedIn) {
      this.checkUserRoles();
    } else {
      this.isBuyer = false;
    }
  };

  private checkUserRoles(): void {
    of(null)
      .pipe(
        delay(100),
        switchMap(() =>
          forkJoin({
            isBuyer: this._loginSvc.isBuyer().pipe(
              catchError((error) => {
                console.error('Error checking buyer role:', error);
                return of(false);
              })
            ),
          })
        )
      )
      .subscribe(({ isBuyer }) => {
        this.isBuyer = isBuyer;
        if (this.isBuyer) {
          console.log('yes!');
        }
      });
  }

  logout() {
    this._loginSvc.logout();
    this.isBuyer = false;
    this.router.navigate(['/login']);
  }

  async login() {
    this.disableLogin = true;
    await this._loginSvc.login('silber@udel.edu', 'pass');
    this.disableLogin = false;
  }

  isNotEmptyObject(obj: any): boolean {
    return obj && Object.keys(obj).length > 0;
  }

  handleModalClick(event: MouseEvent): void {
    // Check if the click was directly on the modal backdrop (not on the content)
    if ((event.target as HTMLElement).classList.contains('modal')) {
      this.closeModal();
    }
  }

  private getAnimalType(animal: string): string {
    const reptiles = [
      'snake',
      'lizard',
      'tortoise',
      'turtle',
      'chameleon',
      'gecko',
    ];
    const smallMammals = [
      'hamster',
      'guinea pig',
      'rabbit',
      'chinchilla',
      'mouse',
    ];

    if (reptiles.includes(animal.toLowerCase())) {
      return 'reptile';
    } else if (smallMammals.includes(animal.toLowerCase())) {
      return 'small-mammal';
    } else if (['dog', 'cat', 'bird', 'fish'].includes(animal.toLowerCase())) {
      return animal.toLowerCase();
    } else {
      return 'dog';
    }
  }

  getAnimalIconPath(animal: string): string {
    return (
      '/assets/icons/multicolored-icons/animal-types/' +
      this.getAnimalType(animal) +
      '.svg'
    );
  }

  loadSimilarPets(): void {
    if (!this.pet) return;

    this.itemService
      .getInventoryItems(0, {})
      .then((items: InventoryItemModel[]) => {
        // Calculate similarity scores for each pet
        const scoredPets = items
          .filter((item) => item._id !== this.pet._id) // Exclude current pet
          .map((item) => {
            const score = this.calculateSimilarityScore(item);
            return { ...item, similarityScore: score };
          })
          .sort((a, b) => b.similarityScore - a.similarityScore) // Sort by highest score
          .slice(0, 4); // Get top 4 most similar pets

        this.similarPets = scoredPets;
      })
      .catch((error) => {
        console.error('Error loading similar pets:', error);
      });
  }

  private calculateSimilarityScore(item: InventoryItemModel): number {
    let score = 0;

    // Same animal type (highest weight: 40%)
    if (item.animal === this.pet.animal) {
      score += 40;
    }

    // Age similarity (weight: 20%)
    const currentPetAge = this.getAge(this.pet.birthdate);
    const itemAge = this.getAge(item.birthdate);
    const ageDifference = Math.abs(currentPetAge - itemAge);
    if (ageDifference < 1) score += 20;
    else if (ageDifference < 2) score += 15;
    else if (ageDifference < 4) score += 10;
    else if (ageDifference < 6) score += 5;

    // Price range similarity (weight: 20%)
    const priceRatio = item.price / this.pet.price;
    if (priceRatio >= 0.8 && priceRatio <= 1.2) score += 20;
    else if (priceRatio >= 0.6 && priceRatio <= 1.4) score += 15;
    else if (priceRatio >= 0.4 && priceRatio <= 1.6) score += 10;

    // Same sex (weight: 10%)
    if (item.sex === this.pet.sex) {
      score += 10;
    }

    // Same breed (weight: 10%)
    if (item.breed === this.pet.breed) {
      score += 10;
    }

    // Round to nearest whole number
    return Math.round(score);
  }

  navigateToSimilarPet(petId: string): void {
    // Add current pet to history if not already there
    const newItem = { name: this.pet.name, id: this.pet._id };

    localStorage.setItem('petHistoryStart', 'browse');
    this.petHistoryStart = 'browse';

    // Check if we're not navigating to a pet already in history
    if (!this.breadcrumbHistory.some((item) => item.id === petId)) {
      // Add current pet to history
      this.breadcrumbHistory.push(newItem);

      // Keep only the last 4 items
      if (this.breadcrumbHistory.length > this.maxHistory - 1) {
        this.breadcrumbHistory.shift(); // Remove oldest item
      }

      // Save to localStorage
      localStorage.setItem(
        'petHistory',
        JSON.stringify(this.breadcrumbHistory)
      );
    }

    this.router.navigate(['/pet', petId]);
  }

  // Add this method to handle breadcrumb navigation
  goToPreviousPet(petId: string): void {
    if (petId) {
      this.router.navigate(['/pet', petId]);
    }
  }
}
