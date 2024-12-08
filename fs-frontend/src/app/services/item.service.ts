import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { InventoryItemModel } from '../models/items.model';
import { Config } from '../config';
import { forkJoin, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  constructor(private httpClient: HttpClient) {}
  public pageSize: number = Config.pageSize;

  // public getInventoryCount(filters: any = {}): Promise<number> {
  //   let params = new HttpParams();
  //   for (const key in filters) {
  //     if (filters[key] !== 'Any') {
  //       params = params.set(key, filters[key]);
  //     }
  //   }

  //   return new Promise<number>((resolve, reject) => {
  //     this.httpClient.get<{ count: number }>(`${Config.apiBaseUrl}/items/count`, { params }).subscribe({
  //       next: (data) => {
  //         resolve(data.count);
  //       },
  //       error: (err) => {
  //         reject(err);
  //       },
  //     });
  //   });
  // }

  public getInventoryItems(page: number = 0, filters: any = {}): Promise<InventoryItemModel[]> {
    const start = page * this.pageSize;
    const end = start + this.pageSize - 1;

    let params = new HttpParams()
      .set('start', start.toString())
      .set('end', end.toString());

    // Add filter parameters if they are set
    for (const key in filters) {
      if (filters[key] !== 'Any') {
        params = params.set(key, filters[key]);
      }
    }

    return new Promise<InventoryItemModel[]>((resolve, reject) => {
      this.httpClient.get<InventoryItemModel[]>(`${Config.apiBaseUrl}/items`, { params }).subscribe({
        next: (data) => {
          resolve(data);
        },
        error: (err) => {
          reject(err);
        },
      });
    });
  }

  // New method to get a single item by its ID
  public getItemById(id: string): Promise<InventoryItemModel> {
    return new Promise<InventoryItemModel>((resolve, reject) => {
      this.httpClient.get<InventoryItemModel>(`${Config.apiBaseUrl}/items/${id}`).subscribe({
        next: (data) => resolve(data),
        error: (err) => reject(err),
      });
    });
  }

  public setItemStatus(itemId: string, status: string): Observable<any> {
    return this.httpClient.put(`${Config.apiBaseUrl}/items/status/${itemId}`, { status: status });
  }

  public deleteItemById(itemId: string): Observable<any> {
    return this.httpClient.delete(`${Config.apiBaseUrl}/items/${itemId}`);
  }
  
  // Method to add a pet to the seller's profile
  public addPet(petData: any): Observable<any> {
    return this.httpClient.post(`${Config.apiBaseUrl}/items`, petData);
  }

  // Method to update a pet's details
  public updatePetDetails(petData: any, petId: string): Observable<any> {
    return this.httpClient.put(`${Config.apiBaseUrl}/items/${petId}`, petData);
  }

  // Method to update pet locations
  public updatePetLocations(petIDs: Object[], newLocation: string): Observable<any> {
    const updateRequests = petIDs.map((petID) =>
      this.updatePetLocation(petID, newLocation) // Call the private method for each ID
    );

    return forkJoin(updateRequests); // Combine all requests into a single observable
  }

  // Private method to update a single pet's location
  private updatePetLocation(petId: Object, newLocation: string): Observable<any> {
    const petIdStr = petId.toString();
    return this.httpClient.put(`${Config.apiBaseUrl}/items/location/${petIdStr}`, { location: newLocation });
  }
}
