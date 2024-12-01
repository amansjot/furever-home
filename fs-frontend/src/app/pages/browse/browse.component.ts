import { Component, HostListener } from '@angular/core';
import { ItemService } from '../../services/item.service';
import { CommonModule } from '@angular/common';
import { InventoryItemModel } from '../../models/items.model';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { BuyerService } from '../../services/buyer.service';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { LoginService } from '../../services/login.service';
import { forkJoin, of } from 'rxjs';
import { catchError, delay, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatMenuModule,
    MatButtonModule,
    MatRadioModule,
    FormsModule,
    MatCheckboxModule,
  ],
  templateUrl: './browse.component.html',
  styleUrls: [
    './browse.styles.scss',
    './browse.styles.filtering.scss',
    './browse.styles.cards.scss',
  ],
})
export class BrowseComponent {
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
    animal: ['Any'],
    sex: ['Any'],
    age: ['Any'],
    price: ['Any'],
    location: ['Any']
  };

  public favoriteFilter: boolean = false;

  public get pageSize(): number {
    return this.itemSvc.pageSize;
  }

  // Track the expanded state of each card using the pet's name as the key
  public expandedCards: { [key: string]: boolean } = {};

  public favorites: string[] = [];

  public isFilterOpen: boolean = false;

  private scrollPosition: number = 0;

  // Track the expanded state of each filter group
  public expandedFilters: {
    applied: boolean;
    animal: boolean;
    sex: boolean;
    age: boolean;
    price: boolean;
    location: boolean;
  } = {
    applied: false,
    animal: false,
    sex: false,
    age: false,
    price: false,
    location: false,
  };

  public isGridView: boolean = false;

  constructor(
    private _loginSvc: LoginService,
    private buyerService: BuyerService,
    private itemSvc: ItemService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Initialize filters as arrays
    this.filters = {
      animal: ['Any'],
      sex: ['Any'],
      age: ['Any'],
      price: ['Any'],
      location: ['Any']
    };

    // Load saved filters from localStorage if they exist
    const savedFilters = localStorage.getItem('filters');
    if (savedFilters) {
      const parsed = JSON.parse(savedFilters);
      // Ensure each filter category is an array
      Object.keys(parsed).forEach(key => {
        if (!Array.isArray(parsed[key])) {
          parsed[key] = [parsed[key]];
        }
      });
      this.filters = parsed;
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
        this.items = (
          await this.itemSvc.getInventoryItems(this.pageIndex, this.filters)
        ).filter((item) => this.favorites.includes(item._id));
      } else {
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

      this.loading = false;
    } catch (err) {
      console.error('Error in loadData:', err);
      this.loading = false;
      throw err; // Re-throw to be caught by the caller
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
    value: string,
    checked: boolean
  ): void {
    // Initialize as array if not already
    if (!Array.isArray(this.filters[type])) {
      this.filters[type] = [];
    }

    if (checked) {
      // If "Any" is selected, clear other selections
      if (value === 'Any') {
        this.filters[type] = ['Any'];
      } else {
        // Remove "Any" if it exists and add the new value
        this.filters[type] = this.filters[type].filter(v => v !== 'Any');
        if (!this.filters[type].includes(value)) {
          this.filters[type].push(value);
        }
      }
    } else {
      // Remove the value
      this.filters[type] = this.filters[type].filter(v => v !== value);
      // If no filters selected, default to "Any"
      if (this.filters[type].length === 0) {
        this.filters[type] = ['Any'];
      }
    }

    // Save to localStorage and reload data
    localStorage.setItem('filters', JSON.stringify(this.filters));
    this.loadData();
  }

  // Toggle the expanded state of a card
  toggleCard(name: string) {
    this.expandedCards[name] = !this.expandedCards[name];
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

    // Immediately update the displayed items if the favorite filter is active
    if (this.favoriteFilter) {
      this.items = this.items.filter((i) => this.favorites.includes(i._id));
    }
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
    // Set loading state immediately
    this.loading = true;
    
    // Delay the actual data change to ensure loading screen is visible first
    setTimeout(() => {
      this.favoriteFilter = !this.favoriteFilter;
      localStorage.setItem('favoriteFilter', JSON.stringify(this.favoriteFilter));
      
      this.loadData().then(() => {
        // Add a minimum delay before hiding loading screen
        setTimeout(() => {
          this.loading = false;
        }, 300);
      }).catch(error => {
        console.error('Error loading data:', error);
        this.loading = false;
      });
    }, 100);
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
      localStorage.setItem('petHistoryStart', 'browse');
      this.router.navigate([`/pet/${petId}`]);
    }
  }

  navigateToPetMobile(petId: string): void {
    localStorage.setItem('petHistoryStart', 'browse');
    this.router.navigate([`/pet/${petId}`]);
  }

  // Listen for window resize events to adjust button visibility
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    const width = (event.target as Window).innerWidth;
    const wasVisible = this.isButtonVisible;
    this.isButtonVisible = width < 1024;

    // Reset expanded cards when transitioning from mobile to desktop
    if (wasVisible && !this.isButtonVisible) {
      this.expandedCards = {};
    }
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

  getAnimalType(animal: string): string {
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
      return 'Reptile';
    } else if (smallMammals.includes(animal.toLowerCase())) {
      return 'Small Mammal';
    } else if (['dog', 'cat', 'bird', 'fish'].includes(animal.toLowerCase())) {
      return animal.charAt(0).toUpperCase() + animal.slice(1); // Capitalize animal type
    } else {
      return 'Other';
    }
  }

  toggleFilters(): void {
    this.isFilterOpen = !this.isFilterOpen;

    if (this.isFilterOpen) {
      // Store the current scroll position
      this.scrollPosition = window.pageYOffset;
      // Add class to lock the scroll
      document.body.classList.add('filter-open');
      // Set the top position to maintain the scroll position
      document.body.style.position = 'fixed';
      document.body.style.top = `-${this.scrollPosition}px`;
      document.body.style.width = '100%';
    } else {
      // Remove the class to unlock the scroll
      document.body.classList.remove('filter-open');
      // Reset the top position
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      // Restore the scroll position
      window.scrollTo(0, this.scrollPosition);
    }
  }

  ngOnDestroy(): void {
    // Clean up any body classes and styles when component is destroyed
    document.body.classList.remove('filter-open');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, this.scrollPosition);
  }

  // Method to toggle the expanded state of a filter group
  toggleFilter(
    filterType: 'applied' | 'animal' | 'sex' | 'age' | 'price' | 'location'
  ): void {
    this.expandedFilters[filterType] = !this.expandedFilters[filterType];
  }

  public resetFilters(): void {
    this.filters = {
      animal: ['Any'],
      sex: ['Any'],
      age: ['Any'],
      price: ['Any'],
      location: ['Any']
    };

    // Reset expanded states
    this.expandedFilters = {
      applied: false,
      animal: false,
      sex: false,
      age: false,
      price: false,
      location: false,
    };

    // Update localStorage
    localStorage.setItem('filters', JSON.stringify(this.filters));

    // Reload data with reset filters
    this.loadData();
  }

  getFilteredItems(): InventoryItemModel[] {
    return this.items.filter(item => {
      const animalMatch = this.filters.animal.includes('Any') || 
        this.filters.animal.includes(this.getAnimalType(item.animal));
      
      const sexMatch = this.filters.sex.includes('Any') || 
        this.filters.sex.some(s => item.sex.toLowerCase() === s.toLowerCase());
      
      const ageMatch = this.filters.age.includes('Any') || 
        this.filters.age.some(age => {
          const itemAge = this.getAge(item.birthdate);
          return (
            (age === 'Very Young' && itemAge < 1) ||
            (age === 'Young' && itemAge >= 1 && itemAge < 3) ||
            (age === 'Adult' && itemAge >= 3 && itemAge < 8) ||
            (age === 'Senior' && itemAge > 8)
          );
        });
      
      const priceMatch = this.filters.price.includes('Any') || 
        this.filters.price.some(price => {
          return (
            (price === 'Low' && item.price < 500) ||
            (price === 'Medium' && item.price >= 500 && item.price <= 1000) ||
            (price === 'High' && item.price > 1000)
          );
        });
      
      const locationMatch = this.filters.location.includes('Any') || 
        this.filters.location.some(loc => {
          return loc === 'Other' 
            ? !['New York', 'Los Angeles', 'Chicago', 'Houston'].includes(item.location)
            : item.location === loc;
        });

      return animalMatch && sexMatch && ageMatch && priceMatch && locationMatch;
    });
  }

  toggleGridView(): void {
    this.isGridView = !this.isGridView;
    // Reset expanded cards when toggling view
    this.expandedCards = {};
  }

  // Check if there are any active filters
  hasActiveFilters(): boolean {
    return Object.entries(this.filters).some(([key, values]) => 
      !values.includes('Any') || (values.includes('Any') && values.length > 1)
    );
  }

  // Get array of active filters for display
  getActiveFilters(): {category: string, value: string}[] {
    const activeFilters: {category: string, value: string}[] = [];
    
    Object.entries(this.filters).forEach(([category, values]) => {
      if (!values.includes('Any')) {
        values.forEach(value => {
          activeFilters.push({
            category: category.charAt(0).toUpperCase() + category.slice(1),
            value: value
          });
        });
      }
    });
    
    return activeFilters;
  }

  // Remove a specific filter
  removeFilter(category: string, value: string): void {
    const filterKey = category.toLowerCase() as keyof typeof this.filters;
    this.filters[filterKey] = this.filters[filterKey].filter(v => v !== value);
    
    // If no filters remain in category, set to 'Any'
    if (this.filters[filterKey].length === 0) {
      this.filters[filterKey] = ['Any'];
    }
    
    localStorage.setItem('filters', JSON.stringify(this.filters));
    this.loadData();
  }
}
