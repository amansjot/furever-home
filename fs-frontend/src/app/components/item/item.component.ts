import { Component, Input, Output, EventEmitter } from '@angular/core';
import { InventoryItemModel } from '../../models/items.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent {
  @Input() item!: InventoryItemModel;
  @Input() isBuyer: boolean = false;
  @Input() expandedCards: { [key: string]: boolean } = {};

  @Output() toggleFavorite = new EventEmitter<InventoryItemModel>();
  @Output() navigateToPetDesktop = new EventEmitter<string>();
  @Output() navigateToPetMobile = new EventEmitter<string>();
  @Output() toggleCard = new EventEmitter<string>();

  onToggleFavorite(event: MouseEvent) {
    event.stopPropagation();
    this.toggleFavorite.emit(this.item);
  }

  onNavigateDesktop(event: MouseEvent) {
    event.stopPropagation();
    this.navigateToPetDesktop.emit(this.item._id);
  }

  onNavigateMobile() {
    this.navigateToPetMobile.emit(this.item._id);
  }

  onToggleCard() {
    this.toggleCard.emit(this.item.name);
  }
}
