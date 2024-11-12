import { Component, HostListener } from '@angular/core';
import { ItemService } from '../../services/item.service';
import { CommonModule } from '@angular/common';
import { InventoryItemModel } from '../../models/items.model';
import { ItemComponent } from '../../components/item/item.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { BuyerService } from '../../services/buyer.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ItemComponent, MatMenuModule, MatButtonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  public authenticated: boolean = false;
  public items: InventoryItemModel[] = [];
  public itemCount: number = 0;
  public pageIndex: number = 0;
  public isButtonVisible = window.innerWidth < 1024;

  // Define filters and their default values
  public filters = {
    animal: 'Any',
    sex: 'Any',
    age: 'Any',
    price: 'Any',
    location: 'Any',
  };

  public favoriteFilter: boolean = false;

  public get pageSize(): number {
    return this.itemSvc.pageSize;
  }

  // Track the expanded state of each card using the pet's name as the key
  public expandedCards: { [key: string]: boolean } = {};

  favorites: any;

  constructor(
    private buyerService: BuyerService,
    private itemSvc: ItemService,
    private router: Router
  ) {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.buyerService.getFavorites().subscribe({
      next: (data) => {
        this.favorites = data;
        this.loadData();
      },
      error: (err) => {
        this.favorites = JSON.parse(localStorage.getItem('favorites') || '');
        console.log('Error loading favorites:', err);
        this.loadData();
      },
    });
  }

  async loadData(): Promise<void> {
    try {
      if (this.favoriteFilter) {
        this.items = (
          await this.itemSvc.getInventoryItems(this.pageIndex, this.filters)
        ).filter((item) => this.favorites.includes(item._id));
      } else {
        this.itemCount = await this.itemSvc.getInventoryCount(this.filters);
        this.items = await this.itemSvc.getInventoryItems(
          this.pageIndex,
          this.filters
        );
      }

      // Update favorite status based on stored favorites
      this.items = this.items.map((item) => ({
        ...item,
        isFavorite: this.favorites.includes(item._id),
      }));
    } catch (err) {
      console.error(err);
    }
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
      return `${ageInYears} year${ageInYears !== 1 ? 's' : ''}`;
    }
  }

  // Method to set the filter value and reload data
  setFilter(
    type: 'animal' | 'sex' | 'age' | 'price' | 'location',
    value: string
  ) {
    this.filters[type] = value;
    console.log(`${type} filter set to: ${value}`);
    this.loadData(); // Reload data based on the updated filters
  }

  // Toggle the expanded state of a card
  toggleCard(name: string) {
    this.expandedCards[name] = !this.expandedCards[name];
  }

  // Toggle the favorite status of a card
  toggleFavorite(event: MouseEvent, item: InventoryItemModel): void {
    event.stopPropagation();

    item.isFavorite = !item.isFavorite; // Toggle the favorite status
    // Update local storage or send to server
    this.updateFavoriteStatus(item);

    // // Save to users collection in the database
    // this.loadProfile();

    // if (!this.profile['favorites']) {
    //   this.profile['favorites'] = [];
    // }

    // if (item.isFavorite) {
    //   this.profile['favorites'].push(item._id);
    // } else {
    //   this.profile['favorites'] = this.profile['favorites'].filter((id: string) => id !== item._id);
    // }

    // this.profileService
    //   .updateProfile(this.profile._id, this.profile)
    //   .subscribe({
    //     next: () => console.log('Profile updated successfully'),
    //     error: (err) => console.error('Error updating profile:', err),
    //   });
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

  toggleFavoriteFilter(): void {
    this.favoriteFilter = !this.favoriteFilter;
    this.loadData();
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
      this.router.navigate([`/pet/${petId}`]);
    }
  }

  navigateToPetMobile(petId: string): void {
    console.log('mobile');
    this.router.navigate([`/pet/${petId}`]);
  }

  // Listen for window resize events to adjust button visibility
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    const width = (event.target as Window).innerWidth;
    this.isButtonVisible = width < 1024;
  }
}
