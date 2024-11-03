import { Component, OnInit } from '@angular/core';
import { SellerService } from '../../services/seller.service';
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

  constructor(private sellerService: SellerService) {}

  ngOnInit(): void {
    this.loadSeller();
  }

  loadSeller(): void {
    const sellerId = "67265fe2848a6bfa1e120faa"; // Example ID
    this.sellerService.getSellerById(sellerId).subscribe({
      next: (data) => (this.seller = data),
      error: (err) => console.error("Error loading seller:", err),
    });
  }
}
