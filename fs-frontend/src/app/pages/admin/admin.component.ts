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
  @ViewChild(MatSort) sort!: MatSort;
  public loading: boolean = true;

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
  public pets = new MatTableDataSource<InventoryItemModel>([]);

  public userColumns: string[] = [
    'name',
    'location',
    'username',
    'roles'
  ];
  public users = new MatTableDataSource<UserModel>([]);

  constructor(
    private _loginSvc: LoginService,
    private itemSvc: ItemService,
    private profileSvc: ProfileService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadPets();
    this.loadUsers();

    this.pets.filterPredicate = (data: InventoryItemModel, filter: string) => {
      const { pictures, ...filteredData } = data;
      const dataStr = JSON.stringify(filteredData).toLowerCase();
      return dataStr.includes(filter);
    };

    this.users.filterPredicate = (data: UserModel, filter: string) => {
      const { password, ...filteredData } = data;
      const dataStr = JSON.stringify(filteredData).toLowerCase();
      return dataStr.includes(filter);
    };
  }
  
  ngAfterViewInit() {
    this.pets.sort = this.sort; // Connect the MatSort to the data source
  }

  async loadUsers(): Promise<void> {
    try {
      this.users.data = await this.profileSvc.getAllUsers();
      this.users.data.forEach(user => {
        if (user.roles) {
          user.roles = user.roles.sort((a: string, b: string) => a.localeCompare(b));
        }
      });
      this.loading = false;
    } catch (err) {
      console.error('Error in loadData:', err);
      this.loading = false;
      throw err;
    }
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

  applyFilterPets(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.pets.filter = filterValue.trim().toLowerCase();
  }
  
  applyFilterUsers(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.users.filter = filterValue.trim().toLowerCase();
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
