import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Config } from '../config';
import { SellerModel } from '../models/seller.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SellerService {
  // Placeholder for the updatePetLocations method
  updatePetLocations() {
    throw new Error('Method not implemented.');
  }

  constructor(private httpClient: HttpClient) {}

  /* Fetch the authenticated seller's profile */
  public getSellerProfile(): Observable<SellerModel> {
    return this.httpClient.get<SellerModel>(`${Config.apiBaseUrl}/seller/me`);
  }

  /* Fetch seller details by their unique ID */
  public getSellerById(id: string): Observable<SellerModel> {
    return this.httpClient.get<SellerModel>(
      `${Config.apiBaseUrl}/seller/${id}`
    );
  }

  /* Fetch seller details by a pet's unique ID */
  public getSellerByPetId(petId: string): Observable<SellerModel> {
    return this.httpClient.get<SellerModel>(`${Config.apiBaseUrl}/seller/ofpet/${petId}`);
  }

  /* Add a user request to a seller's list of requests */
  public addRequestToSeller(sellerId: string, userId: string, petId: string): Observable<any> {
    return this.httpClient.patch(`${Config.apiBaseUrl}/seller/${sellerId}/requests`, {
      userId, petId
    });
  }

  // Method to remove a specific request from the seller's requests array
  public closeRequest(sellerId: string, userId: string, petId: string): Observable<any> {
    const params = new HttpParams()
    .set('userId', userId)
      .set('petId', petId);
    
      return this.httpClient.delete(`${Config.apiBaseUrl}/seller/${sellerId}/requests`, { params });
  }
}
