import { Component, HostListener, OnInit } from '@angular/core';
import { LoginService } from '../../services/login.service';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { NavigationEnd, Router, RouterLink, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin, of } from 'rxjs';
import { catchError, delay, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule, RouterLink, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  public disableLogin: boolean = false;
  public authenticated: boolean = false;
  public isAdmin: boolean = false;
  public isSeller: boolean = false;
  public showButtons: boolean = true;

  constructor(private _loginSvc: LoginService, private router: Router) {
    _loginSvc.loggedIn.subscribe(this.onLoginChange);

    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.showButtons = !(event.url.includes("login") || event.url.includes("register"));
      }
    });
  }

  onLoginChange = (loggedIn: boolean) => {
    this.authenticated = loggedIn;

    if (loggedIn) {
      this.checkUserRoles();
    } else {
      this.resetRoles();
    }
    console.log("Change:" + this.authenticated);
  };

  private checkUserRoles(): void {
    of(null).pipe(
      delay(1000),
      switchMap(() =>
        forkJoin({
          isSeller: this._loginSvc.isSeller().pipe(
            catchError((error) => {
              console.error('Error checking seller role:', error);
              return of(false);
            })
          ),
          isAdmin: this._loginSvc.isAdmin().pipe(
            catchError((error) => {
              console.error('Error checking admin role:', error);
              return of(false);
            })
          ),
        })
      )
    ).subscribe(({ isSeller, isAdmin }) => {
      this.isSeller = isSeller;
      this.isAdmin = isAdmin;
    });
  }

  private resetRoles(): void {
    this.isAdmin = false;
    this.isSeller = false;
  }

  logout() {
    this._loginSvc.logout();
    this.resetRoles();
    this.router.navigate(['/login']);
  }

  async login() {
    this.disableLogin = true;
    await this._loginSvc.login("silber@udel.edu", "pass");
    this.disableLogin = false;
  }

  // Navbar CSS and scrolling functionality
  public isNavbarHidden = false;
  private lastScrollPosition = 0;
  public isMenuOpen: boolean = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (!this.isMenuOpen) {
      const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      this.isNavbarHidden = currentScrollPosition > this.lastScrollPosition;
      this.lastScrollPosition = currentScrollPosition;
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isMenuOpen) {
      this.isNavbarHidden = false;
    }
  }

  get showHamburger(): boolean {
    return this.showButtons;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedElement = event.target as HTMLElement;
    const isMenuClick = clickedElement.closest('.menu-overlay');
    const isHamburgerClick = clickedElement.closest('.hamburger-btn');

    if (!isMenuClick && !isHamburgerClick && this.isMenuOpen) {
      this.isMenuOpen = false;
    }
  }

  onMenuItemClick() {
    const menuOverlay = document.querySelector('.menu-overlay');
    menuOverlay?.classList.add('quick-close');
    this.isMenuOpen = false;
    setTimeout(() => {
      menuOverlay?.classList.remove('quick-close');
    }, 100);
  }
}
