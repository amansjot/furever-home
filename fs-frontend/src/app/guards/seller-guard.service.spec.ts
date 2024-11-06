import { TestBed } from '@angular/core/testing';

import { SellerGuardService } from './seller-guard.service';

describe('SellerGuardService', () => {
  let service: SellerGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SellerGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
