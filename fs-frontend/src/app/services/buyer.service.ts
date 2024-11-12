import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Config } from '../config';
import { Observable } from 'rxjs';
import { BuyerModel } from '../models/buyer.model';
import { ObjectId } from "mongodb";

@Injectable({
  providedIn: 'root',
})
export class BuyerService {
  constructor(private httpClient: HttpClient) {}

  // Method to fetch the authenticated buyer
  public getBuyer(): Observable<BuyerModel> {
    return this.httpClient.get<BuyerModel>(`${Config.apiBaseUrl}/users/me`);
  }

  public getFavorites(): Observable<BuyerModel> {
    return this.httpClient.get<BuyerModel>(`${Config.apiBaseUrl}/buyer/favorites/`);
  }

  // New method to update the authenticated buyer's favorites
  public updateFavorites(favorites: string[]): Observable<any> {
    return this.httpClient.put(`${Config.apiBaseUrl}/buyer/favorites/`, { favorites });
  }
}
