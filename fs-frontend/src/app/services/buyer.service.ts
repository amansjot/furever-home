import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Config } from '../config';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { BuyerModel } from '../models/buyer.model';
import { InventoryItemModel } from '../models/items.model';
import Munkres from 'munkres-js';
import { ObjectId } from "mongodb";

@Injectable({
  providedIn: 'root',
})
export class BuyerService {
  private weights = {
    petType: 10,
    petLocation: 9,
    petLifestyle: 8,
    petPersonality: 7,
    petAge: 6,
    petSize: 5,
    petSex: 4,
  };

  constructor(private httpClient: HttpClient) {}

  // Method to fetch the authenticated buyer
  public getBuyer(): Observable<BuyerModel> {
    return this.httpClient.get<BuyerModel>(`${Config.apiBaseUrl}/users/me`);
  }

  public getFavorites(): Observable<string[]> {
    return this.httpClient.get<string[]>(`${Config.apiBaseUrl}/buyer/favorites/`).pipe(
      catchError((error) => {
        console.error('Error fetching favorites:', error);
        return of([]); 
      })
    );
  }

  // New method to update the authenticated buyer's favorites
  public updateFavorites(favorites: string[]): Observable<any> {
    return this.httpClient.put(`${Config.apiBaseUrl}/buyer/favorites/`, { favorites });
  }

  public getPreferences(): Observable<{ [key: string]: any }> {
    return this.httpClient.get<{ [key: string]: any }>(`${Config.apiBaseUrl}/buyer/preferences/`).pipe(
      catchError((error) => {
        console.error('Error fetching preferences:', error);
        return of({}); 
      })
    );
  }

  // Method to update preferences
  public updatePreferences(preferences: { [key: string]: any }): Observable<any> {
    return this.httpClient.put(`${Config.apiBaseUrl}/buyer/preferences/`, { preferences });
  }

  // Method to fetch recommended pets
  public getRecommendedPets(): Observable<string[]> {
    return this.httpClient.get<string[]>(`${Config.apiBaseUrl}/buyer/recommended/`).pipe(
      catchError((error) => {
        console.error('Error fetching recommended pets:', error);
        return of([]);
      })
    );
  }

  // Method to update recommended pets
  public updateRecommendedPets(recommendedPets: string[]): Observable<any> {
    return this.httpClient.put(`${Config.apiBaseUrl}/buyer/recommended/`, { recommendedPets });
  }

  // Logic for matching buyers with pets using Munkres
  public matchBuyersWithPets(buyers: BuyerModel[], pets: InventoryItemModel[]): Record<string, InventoryItemModel[]> {
    const matches: Record<string, InventoryItemModel[]> = {};

    // Build compatibility matrix for each buyer
    for (const buyer of buyers) {
      const matrix = this.buildCompatibilityMatrix(buyer, pets);

      // Use Munkres algorithm for optimal matching
      const munkres = new Munkres();
      const assignments = munkres.compute(matrix);

      // Extract matched pets and sort by compatibility score
      const rankedPets = assignments
        .map(([buyerIndex, petIndex]) => ({
          pet: pets[petIndex],
          score: -matrix[buyerIndex][petIndex], // Negative because Munkres minimizes
        }))
        .sort((a, b) => b.score - a.score) // Sort by descending score
        .map((item) => item.pet);

      matches[buyer._id.toString()] = rankedPets;
    }

    return matches;
  }

  // Build compatibility matrix for a single buyer
  private buildCompatibilityMatrix(buyer: BuyerModel, pets: InventoryItemModel[]): number[][] {
    const matrix: number[][] = [];

    for (const pet of pets) {
      const score = this.calculateCompatibilityScore(buyer, pet);
      matrix.push([-score]); // Negative score because Munkres minimizes
    }

    return matrix;
  }

  // Calculate compatibility score between a buyer and a pet
  private calculateCompatibilityScore(buyer: BuyerModel, pet: InventoryItemModel): number {
    let score = 0;

    // Pet Type
    if (buyer.preferences.petType === pet.petType) {
      score += this.weights.petType;
    }

    // Pet Location
    if (buyer.preferences.petLocation === pet.location) {
      score += this.weights.petLocation;
    }

    // Pet Lifestyle (array overlap check)
    if (
      buyer.preferences.petLifestyle.some((lifestyle) =>
        pet.petLifestyle.includes(lifestyle)
      )
    ) {
      score += this.weights.petLifestyle;
    }

    // Pet Personality (array overlap check)
    if (
      buyer.preferences.petPersonality.some((personality) =>
        pet.petPersonality.includes(personality)
      )
    ) {
      score += this.weights.petPersonality;
    }

    // Pet Age
    if (buyer.preferences.petAge === pet.ageGroup) {
      score += this.weights.petAge;
    }

    // Pet Size
    if (buyer.preferences.petSize === pet.petSize) {
      score += this.weights.petSize;
    }

    // Pet Sex
    if (buyer.preferences.petSex === pet.sex) {
      score += this.weights.petSex;
    }

    return score;
  }
}
