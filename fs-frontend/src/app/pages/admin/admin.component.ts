import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
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
import { ProfileService } from '../../services/profile.service';
import { UserModel } from '../../models/users.model';
import { MatChipsModule } from '@angular/material/chips';
import { MatSort, MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatTableModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatSortModule
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit {
  public loading: boolean = true;

  // Column definitions for pets table
  public petsColumns: string[] = [
    'name',
    'status',
    'animal',
    'breed',
    'birthdate',
    'price',
    'location',
    'actions',
  ];
  public pets = new MatTableDataSource<InventoryItemModel>([]); // Data source for pets

  // Column definitions for users table
  public userColumns: string[] = [
    'name',
    'location',
    'username',
    'roles'
  ];
  public users = new MatTableDataSource<UserModel>([]); // Data source for users

  constructor(
    private _loginSvc: LoginService, // Service for authentication and user login
    private itemSvc: ItemService, // Service for managing items (pets)
    private profileSvc: ProfileService, // Service for user profiles
    private router: Router, // Router for navigation
    private dialog: MatDialog // Service for managing dialogs
  ) {}

  ngOnInit(): void {
    this.loadPets(); // Load pets data on component initialization
    this.loadUsers(); // Load users data on component initialization

    // Custom filter for pets table
    this.pets.filterPredicate = (data: InventoryItemModel, filter: string) => {
      const { pictures, ...filteredData } = data; // Exclude pictures from filtering
      const dataStr = JSON.stringify(filteredData).toLowerCase();
      return dataStr.includes(filter); // Check if data includes filter value
    };

    // Custom filter for users table
    this.users.filterPredicate = (data: UserModel, filter: string) => {
      const { password, ...filteredData } = data; // Exclude passwords from filtering
      const dataStr = JSON.stringify(filteredData).toLowerCase();
      return dataStr.includes(filter); // Check if data includes filter value
    };
  }
  
  async loadUsers(): Promise<void> {
    try {
      this.users.data = await this.profileSvc.getAllUsers(); // Fetch users from service
      this.users.data.forEach(user => {
        if (user.roles) {
          // Sort roles alphabetically
          user.roles = user.roles.sort((a: string, b: string) => a.localeCompare(b));
        }
      });
      this.loading = false; // Set loading to false after data is loaded
    } catch (err) {
      console.error('Error in loadData:', err); // Log any errors
      this.loading = false;
      throw err;
    }
  }

  // Load pets from the server
  async loadPets(): Promise<void> {
    try {
      this.pets.data = await this.itemSvc.getInventoryItems(); // Fetch pets from service
      this.loading = false; // Set loading to false after data is loaded
    } catch (err) {
      console.error('Error in loadData:', err); // Log any errors
      this.loading = false;
      throw err;
    }
  }

  // Apply filter to pets table
  applyFilterPets(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.pets.filter = filterValue.trim().toLowerCase(); // Set the filter value
  }
  
  // Apply filter to users table
  applyFilterUsers(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.users.filter = filterValue.trim().toLowerCase(); // Set the filter value
  }

  // Confirm deletion of a pet
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
        this.deletePet(itemId); // Delete the pet if confirmed
      }
    });
  }

  // Delete a pet by ID
  deletePet(itemId: string): void {
    this.itemSvc.deleteItemById(itemId).subscribe({
      next: () => {
        // Update the data of the MatTableDataSource
        const updatedPets = this.pets.data.filter((pet) => pet._id !== itemId); // Remove deleted pet
        this.pets.data = updatedPets; // Update the table data
        console.log('Item deleted successfully'); // Log success message
      },
      error: (err: any) => {
        console.error('Error deleting item:', err); // Log error message
      },
    });
  }  
}
