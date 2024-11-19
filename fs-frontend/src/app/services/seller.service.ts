import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Config } from '../config';
import { SellerModel } from '../models/seller.model';

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

  public getSellerContactByPetId(petId: string) {
    return this.httpClient.get<{
      orgName: string;
      sellerType: string;
      sellerLocation: string;
      sellerContact: string;
    }>(`${Config.apiBaseUrl}/seller/contact/${petId}`);
  }
}
