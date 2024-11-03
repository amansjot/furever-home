import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SellerModel } from '../models/sellers.model';
import { Config } from '../config';

@Injectable({
  providedIn: 'root',
})
export class SellerService {
  constructor(private httpClient: HttpClient) {}

  getSellerInfo(): Observable<SellerModel> {
    return this.httpClient.get<SellerModel>(`${Config.apiBaseUrl}/seller/me`);
  }
}
