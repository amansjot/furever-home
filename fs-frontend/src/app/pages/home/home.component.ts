import { Component, HostListener } from '@angular/core';
import { ItemService } from '../../services/item.service';
import { CommonModule } from '@angular/common';
import { InventoryItemModel } from '../../models/items.model';
import { ItemComponent } from '../../components/item/item.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { BuyerService } from '../../services/buyer.service';

import { LoginService } from '../../services/login.service';
import { forkJoin, of } from 'rxjs';
import { catchError, delay, switchMap } from 'rxjs/operators';
import { ObjectId } from 'mongodb';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ItemComponent, MatMenuModule, MatButtonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  public loading: boolean = true;
  public disableLogin: boolean = false;
  public authenticated: boolean = false;
  public isBuyer: boolean = false;
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

  public favorites: string[] = [];

  constructor(
    private _loginSvc: LoginService,
    private buyerService: BuyerService,
    private itemSvc: ItemService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load saved filters from localStorage if they exist
    const savedFilters = localStorage.getItem('filters');
    if (savedFilters) {
      this.filters = JSON.parse(savedFilters);
    }

    // Load saved favorite filter state
    const savedFavoriteFilter = localStorage.getItem('favoriteFilter');
    this.favoriteFilter = savedFavoriteFilter
      ? JSON.parse(savedFavoriteFilter)
      : false;

    // Subscribe to login changes to update the buyer status dynamically
    this._loginSvc.loggedIn.subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        this._loginSvc.loggedIn.subscribe(this.onLoginChange);
      } else {
        this.isBuyer = false;
      }
    });
    this.favorites = JSON.parse(localStorage.getItem('favorites') || '');
    this.loadData();
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
        // this.itemCount = this.favorites.length;
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

      this.loading = false;

      // Update favorite status based on stored favorites
      this.items = this.items.map((item) => ({
        ...item,
        isFavorite: this.favorites.includes(item._id),
      }));
    } catch (err) {
      console.error(err);
      this.loading = false;
    }
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

  // Method to set the filter value and reload data
  setFilter(
    type: 'animal' | 'sex' | 'age' | 'price' | 'location',
    value: string
  ) {
    this.filters[type] = value;
    console.log(`${type} filter set to: ${value}`);

    localStorage.setItem('filters', JSON.stringify(this.filters));
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
    localStorage.setItem('favoriteFilter', JSON.stringify(this.favoriteFilter));
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

  onLoginChange = (loggedIn: boolean) => {
    this.authenticated = loggedIn;

    if (loggedIn) {
      this.checkUserRoles();
    } else {
      this.isBuyer = false;
    }
    console.log('Change:' + this.authenticated);
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
          this.loadFavorites();
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
}
