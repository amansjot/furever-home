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

  constructor(
    private route: ActivatedRoute,
    private itemService: ItemService
  ) {}

  ngOnInit(): void {
    const petId = this.route.snapshot.paramMap.get('id'); // Retrieve ID from route

    if (petId) {
      this.itemService.getItemById(petId).then(
        (pet) => this.pet = pet,
        (error) => console.error("Error fetching pet details:", error)
      );
    }
  }
}
