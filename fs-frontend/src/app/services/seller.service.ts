import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Config } from '../config';
import { SellerModel } from '../models/seller.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SellerService {
  constructor(private httpClient: HttpClient) {}

  // Method to fetch the authenticated seller's profile
  public getSellerProfile() {
    return this.httpClient.get<SellerModel>(`${Config.apiBaseUrl}/seller/me`);
  }

  public getSellerById(id: string) {
    return this.httpClient.get<SellerModel>(
      `${Config.apiBaseUrl}/seller/${id}`
    );
  }

  public getSellerByPetId(petId: string) {
    return this.httpClient.get<SellerModel>(`${Config.apiBaseUrl}/seller/ofpet/${petId}`);
  }

  public addRequestToSeller(sellerId: string, userId: string): Observable<any> {
    return this.httpClient.patch(`${Config.apiBaseUrl}/seller/${sellerId}/requests`, {
      userId,
    });
  }
}
