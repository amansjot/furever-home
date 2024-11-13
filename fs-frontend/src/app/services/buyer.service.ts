import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Config } from '../config';
import { catchError, Observable, of, switchMap } from 'rxjs';
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

  public getFavorites(): Observable<string[]> {
    return this.httpClient.get<string[]>(`${Config.apiBaseUrl}/buyer/favorites/`).pipe(
      catchError((error) => {
        console.error('Error fetching favorites:', error);
        return of([]); // Return an empty array in case of an error
      })
    );
  }

  // New method to update the authenticated buyer's favorites
  public updateFavorites(favorites: string[]): Observable<any> {
    return this.httpClient.put(`${Config.apiBaseUrl}/buyer/favorites/`, { favorites });
  }
}
