import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Config } from '../config';

@Injectable({
  providedIn: 'root'
})
export class SellerService {
  constructor(private httpClient: HttpClient) {}

  getSellerById(id: string) {
    return this.httpClient.get(`${Config.apiBaseUrl}/seller/${id}`);
  }
}
