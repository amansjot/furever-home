import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ItemService } from '../../services/item.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pet.component.html',
  styleUrls: ['./pet.component.scss']
})
export class PetComponent implements OnInit {
  pet: any;
  currentImageIndex: number = 0;
  isModalOpen: boolean = false; // Track modal state

  constructor(
    private route: ActivatedRoute,
    private itemService: ItemService
  ) {}

  ngOnInit(): void {
    const petId = this.route.snapshot.paramMap.get('id'); // Retrieve ID from route

    if (petId) {
      this.itemService.getItemById(petId).then(
        (pet) => {
          this.pet = pet;
          // Ensure the main image is the first in the carousel
          if (this.pet.image && (!this.pet.pictures || !this.pet.pictures.includes(this.pet.image))) {
            this.pet.pictures = [this.pet.image, ...(this.pet.pictures || [])];
          }
        },
        (error) => console.error("Error fetching pet details:", error)
      );
    }
  }

  nextImage(): void {
    if (this.pet.pictures && this.pet.pictures.length) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.pet.pictures.length;
    }
  }

  prevImage(): void {
    if (this.pet.pictures && this.pet.pictures.length) {
      this.currentImageIndex = (this.currentImageIndex - 1 + this.pet.pictures.length) % this.pet.pictures.length;
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
}
