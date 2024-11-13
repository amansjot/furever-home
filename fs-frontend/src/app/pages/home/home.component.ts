import { Component, HostListener } from '@angular/core';
import { ItemService } from '../../services/item.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // Add FormsModule
import { InventoryItemModel } from '../../models/items.model';
import { ItemComponent } from '../../components/item/item.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { BuyerService } from '../../services/buyer.service';
import { LoginService } from '../../services/login.service';
import { forkJoin, of } from 'rxjs';
import { catchError, delay, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, ItemComponent, MatMenuModule, MatButtonModule], // Add FormsModule to imports
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  public disableLogin: boolean = false;
  public authenticated: boolean = false;
  public isBuyer: boolean = false;
  public items: InventoryItemModel[] = [];
  public itemCount: number = 0;
  public pageIndex: number = 0;
  public isButtonVisible = window.innerWidth < 1024;

  public filters = {
    animal: 'Any',
    sex: 'Any',
    age: 'Any',
    price: 'Any',
    location: 'Any',
  };

  public favoriteFilter: boolean = false;
  public expandedCards: { [key: string]: boolean } = {};
  public favorites: string[] = [];

  constructor(
    private _loginSvc: LoginService,
    private buyerService: BuyerService,
    private itemSvc: ItemService,
    private router: Router
  ) {}

  ngOnInit(): void {
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
        this.itemCount = await this.itemSvc.getInventoryCount(this.filters);
        this.items = await this.itemSvc.getInventoryItems(
          this.pageIndex,
          this.filters
        );
      }

      this.items = this.items.map((item) => ({
        ...item,
        isFavorite: this.favorites.includes(item._id),
      }));
    } catch (err) {
      console.error(err);
    }
  }

  toggleFavorite(item: InventoryItemModel): void {
    item.isFavorite = !item.isFavorite;
    this.updateFavoriteStatus(item);
  }

  updateFavoriteStatus(item: InventoryItemModel): void {
    if (item.isFavorite) {
      this.favorites.push(item._id);
    } else {
      const index = this.favorites.indexOf(item._id);
      if (index > -1) this.favorites.splice(index, 1);
    }

    localStorage.setItem('favorites', JSON.stringify(this.favorites));

    this.buyerService.updateFavorites(this.favorites).subscribe({
      next: () => console.log('Favorites updated successfully'),
      error: (err) => console.error('Error updating favorites:', err),
    });
  }

  toggleFavoriteFilter(): void {
    this.favoriteFilter = !this.favoriteFilter;
    this.loadData();
  }

  navigateToPetDesktop(petId: string): void {
    if (!this.isButtonVisible) {
      this.router.navigate([`/pet/${petId}`]);
    }
  }

  navigateToPetMobile(petId: string): void {
    this.router.navigate([`/pet/${petId}`]);
  }

  toggleCard(name: string): void {
    this.expandedCards[name] = !this.expandedCards[name];
  }

  clearFilters(): void {
    this.filters = { animal: 'Any', sex: 'Any', age: 'Any', price: 'Any', location: 'Any' };
    this.loadData();
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
}
