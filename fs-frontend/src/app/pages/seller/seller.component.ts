import { emptySeller, SellerModel } from './../../models/sellers.model';
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
  public sellerInfo: SellerModel = emptySeller;

  constructor(private sellerService: SellerService) {}

  ngOnInit(): void {
    this.sellerService.getSellerInfo().subscribe({
      next: (data) => {
        this.sellerInfo = data;
      },
      error: (err) => {
        console.error('Error fetching seller info:', err);
      }
    });
  }
}
