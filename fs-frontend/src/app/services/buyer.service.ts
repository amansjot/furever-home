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
    return this.httpClient.get<string[]>(`${Config.apiBaseUrl}/buyer/favorites`).pipe(
      catchError((error) => {
        console.error('Error fetching favorites:', error);
        return of([]); 
      })
    );
  }

  // New method to update the authenticated buyer's favorites
  public updateFavorites(favorites: string[]): Observable<any> {
    return this.httpClient.put(`${Config.apiBaseUrl}/buyer/favorites`, { favorites });
  }

  public getPreferences(): Observable<{ [key: string]: any }> {
    return this.httpClient.get<{ [key: string]: any }>(`${Config.apiBaseUrl}/buyer/preferences`).pipe(
      catchError((error) => {
        console.error('Error fetching preferences:', error);
        return of({}); 
      })
    );
  }

  // Method to update preferences
  public updatePreferences(preferences: { [key: string]: any }): Observable<any> {
    return this.httpClient.put(`${Config.apiBaseUrl}/buyer/preferences`, { preferences });
  }
}
