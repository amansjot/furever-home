import { Component, OnInit } from '@angular/core';
import { SellerService } from '../../services/seller.service';
import { ItemService } from '../../services/item.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-seller',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seller.component.html',
  styleUrls: ['./seller.component.scss']
})
export class SellerComponent implements OnInit {
  seller: any;
  pets: any[] = [];

  constructor(private sellerService: SellerService, private itemService: ItemService) {}

  ngOnInit(): void {
    this.loadSeller();
  }

  loadSeller(): void {
    this.sellerService.getSellerProfile().subscribe({
      next: (data) => {
        this.seller = data;
        this.loadPets();
      },
      error: (err) => console.error("Error loading seller:", err),
    });
  }

  loadPets(): void {
    if (this.seller.pets && this.seller.pets.length) {
      this.seller.pets.forEach((petId: string) => {
        this.itemService.getItemById(petId).then(
          (pet) => this.pets.push(pet),
          (err) => console.error("Error loading pet:", err)
        );
      });
    }
  }

  addItem(sellerId: string): void {

  }

  editItem(itemId: string): void {
    
  }

  confirmDelete(itemId: string): void {
    const isConfirmed = confirm("Are you sure you want to delete this item?");
    if (isConfirmed) {
      this.deleteItem(itemId);
    }
  }

  deleteItem(itemId: string): void {
    this.itemService.deleteItemById(itemId).subscribe({
      next: () => {
        this.pets = this.pets.filter(pet => pet._id !== itemId); // Remove item from local array
        console.log('Item deleted successfully');
      },
      error: (err: any) => {
        console.error('Error deleting item:', err);
      }
    });
  }
}
