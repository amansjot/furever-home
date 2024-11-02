import { Component } from '@angular/core';
import { ItemService } from '../../services/item.service';
import { CommonModule } from '@angular/common';
import { InventoryItemModel } from '../../models/items.model';
import { MatCardModule } from '@angular/material/card';
import { ItemComponent } from "../../components/item/item.component";
import { MatPaginatorModule, MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { CustomPaginatorIntl } from './custom-paginator-intl'; // Import the custom paginator
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ItemComponent, MatPaginatorModule, MatMenuModule, MatButtonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [
    { provide: MatPaginatorIntl, useClass: CustomPaginatorIntl }
  ]
})
export class HomeComponent {
  public items: InventoryItemModel[] = [];
  public itemCount: number = 0;
  public pageIndex: number = 0;

  // Define filters and their default values
  public filters = {
    animal: 'Any',
    sex: 'Any',
    age: 'Any',
    price: 'Any',
    location: 'Any'
  };

  public get pageSize(): number {
    return this.itemSvc.pageSize;
  }

  // Track the expanded state of each card using the pet's name as the key
  public expandedCards: { [key: string]: boolean } = {};

  constructor(private itemSvc: ItemService) {
    this.loadData();
  }

  async loadData(): Promise<void> {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    try {
      // Fetch item count and items based on current filters and page index
      this.itemCount = await this.itemSvc.getInventoryCount(this.filters);
      this.items = await this.itemSvc.getInventoryItems(this.pageIndex, this.filters);
      this.items = this.items.map(item => ({
        ...item,
        isFavorite: favorites.includes(item._id)
      }));
    } catch (err) {
      console.error(err);
    }
  }

  handlePageEvent = (event: PageEvent) => {
    console.log(event.pageIndex);
    this.pageIndex = event.pageIndex;
    this.loadData();
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
  setFilter(type: 'animal' | 'sex' | 'age' | 'price' | 'location', value: string) {
    this.filters[type] = value;
    console.log(`${type} filter set to: ${value}`);
    this.loadData(); // Reload data based on the updated filters
  }

  // Toggle the expanded state of a card
  toggleCard(name: string) {
    this.expandedCards[name] = !this.expandedCards[name];
  }

  // Toggle the favorite status of a card
  toggleFavorite(item: InventoryItemModel): void {
    item.isFavorite = !item.isFavorite; // Toggle the favorite status
    // Update local storage or send to server
    this.updateFavoriteStatus(item);
  }

  updateFavoriteStatus(item: InventoryItemModel): void {
    // Here you can add logic to save to local storage
    // For example:
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (item.isFavorite) {
      // Add to favorites if marked as favorite
      favorites.push(item._id);
    } else {
      // Remove from favorites if unmarked
      const index = favorites.indexOf(item._id);
      if (index > -1) favorites.splice(index, 1);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }
}
