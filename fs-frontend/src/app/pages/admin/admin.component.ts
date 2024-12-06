import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../services/login.service';
import { Router, RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ItemService } from '../../services/item.service';
import { InventoryItemModel } from '../../models/items.model';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatTableModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit {
  // public pets: InventoryItemModel[] = [];
  public loading: boolean = true;
  public isSeller: boolean = false;
  public displayedColumns: string[] = [
    'name',
    'status',
    'animal',
    'breed',
    'birthdate',
    'price',
    'location',
    'actions',
  ];
  public pets = new MatTableDataSource<InventoryItemModel>([]);

  constructor(
    private _loginSvc: LoginService,
    private itemSvc: ItemService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadPets();

    this.pets.filterPredicate = (data: InventoryItemModel, filter: string) => {
      const dataStr = JSON.stringify(data).toLowerCase();
      return dataStr.includes(filter);
    };
  }

  async loadPets(): Promise<void> {
    try {
      this.pets.data = await this.itemSvc.getInventoryItems();
      this.loading = false;
    } catch (err) {
      console.error('Error in loadData:', err);
      this.loading = false;
      throw err;
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.pets.filter = filterValue.trim().toLowerCase();
  }

  confirmDelete(itemId: string): void {
    // Open the confirmation dialog
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        action: 'Remove Pet',
        message:
          'Are you sure you want to permanently remove this pet? This cannot be undone.',
      },
      width: '400px',
    });

    // Handle the user's confirmation
    dialogRef.afterClosed().subscribe((isConfirmed) => {
      if (isConfirmed) {
        this.deletePet(itemId);
      }
    });
  }

  deletePet(itemId: string): void {
    this.itemSvc.deleteItemById(itemId).subscribe({
      next: () => {
        // Update the data of the MatTableDataSource
        const updatedPets = this.pets.data.filter((pet) => pet._id !== itemId);
        this.pets.data = updatedPets; // Update the table data
        console.log('Item deleted successfully');
      },
      error: (err: any) => {
        console.error('Error deleting item:', err);
      },
    });
  }  
}
