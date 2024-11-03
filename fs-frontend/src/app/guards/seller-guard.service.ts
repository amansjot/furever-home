import { Injectable } from '@angular/core';
import { LoginService } from '../services/login.service';
import { CanActivate, Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SellerGuardService implements CanActivate {
  constructor(private _loginSvc: LoginService, private _router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this._loginSvc.authorize().pipe(
      switchMap((isAuthorized) => {
        if (isAuthorized) {
          return this._loginSvc.isSeller().pipe(
            map((isSeller) => {
              if (!isSeller) this._router.navigate(['/login']);
              return isSeller;
            })
          );
        } else {
          this._router.navigate(['/login']);
          return of(false);
        }
      }),
      catchError((error) => {
        console.error(error);
        this._router.navigate(['/login']);
        return of(false);
      })
    );
  }
}
