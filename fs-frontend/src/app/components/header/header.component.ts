import { Component, HostListener, OnInit } from '@angular/core';
import { LoginService } from '../../services/login.service';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { NavigationEnd, Router, RouterLink, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin, of } from 'rxjs';
import { catchError, delay, switchMap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule, RouterLink, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  public disableLogin: boolean = false;
  public authenticated: boolean = false;
  public isAdmin: boolean = false;
  public isSeller: boolean = false;
  public isBuyer: boolean = false;
  public showButtons: boolean = true;

  private noHideRoutes: string[] = ['register', 'login'];

  private contentDivOffset: number = 0;

  constructor(
    private _loginSvc: LoginService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    _loginSvc.loggedIn.subscribe(this.onLoginChange);

    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.showButtons = !(event.url.includes("login") || event.url.includes("register"));
      }
    });
  }

  ngOnInit() {
    this.updateContentDivOffset();

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        setTimeout(() => this.updateContentDivOffset(), 100);
      }
    });
  }

  private updateContentDivOffset(): void {
    if (this.router.url === '/') {
      const contentDiv = document.querySelector('.landing-first-component-container .content');
      if (contentDiv) {
        this.contentDivOffset = (contentDiv.getBoundingClientRect().bottom + window.pageYOffset) - 45;
      }
    }
  }

  onLoginChange = (loggedIn: boolean) => {
    this.authenticated = loggedIn;

    if (loggedIn) {
      this.checkUserRoles();
    } else {
      this.resetRoles();
    }
  };

  private checkUserRoles(): void {
    of(null).pipe(
      delay(250),
      switchMap(() =>
        forkJoin({
          isBuyer: this._loginSvc.isBuyer().pipe(
            catchError((error) => {
              console.error('Error checking buyer role:', error);
              return of(false);
            })
          ),
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
    ).subscribe(({ isBuyer, isSeller, isAdmin }) => {
      this.isBuyer = isBuyer;
      this.isSeller = isSeller;
      this.isAdmin = isAdmin;
    });
  }

  private resetRoles(): void {
    this.isAdmin = false;
    this.isBuyer = false;
    this.isSeller = false;
  }

  logout() {
    this._loginSvc.logout();
    this.resetRoles();
    this.router.navigate(['']);
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
      const isLandingPage = this.router.url === '/';
      const isNoHidePage = this.noHideRoutes.some(route => this.router.url.includes(route));

      if (!isNoHidePage) {
        if (isLandingPage) {
          // Only hide navbar when scrolled past the content div
          this.isNavbarHidden = currentScrollPosition > this.lastScrollPosition && 
                               currentScrollPosition > this.contentDivOffset;
        } else {
          // Original behavior for other pages
          this.isNavbarHidden = currentScrollPosition > this.lastScrollPosition;
        }
      } else {
        this.isNavbarHidden = false;
      }

      this.lastScrollPosition = currentScrollPosition;
    }
  }

  toggleMenu() {
    if (this.isMenuOpen) {
      // When closing
      const toolbar = document.querySelector('.mat-toolbar') as HTMLElement;
      toolbar?.classList.add('closing');
      setTimeout(() => {
        this.isMenuOpen = false;
        toolbar?.classList.remove('closing');
      }, 10);
    } else {
      // When opening
      this.isMenuOpen = true;
      // Calculate and set height after a brief delay to ensure DOM is updated
      setTimeout(() => {
        const toolbar = document.querySelector('.mat-toolbar') as HTMLElement;
        const mobileMenu = document.querySelector('.mobile-menu-content') as HTMLElement;
        if (toolbar && mobileMenu) {
          const menuHeight = mobileMenu.getBoundingClientRect().height;
          const totalHeight = 75 + menuHeight + 40; // base height + menu + padding
          toolbar.style.setProperty('--expanded-height', `${totalHeight}px`);
        }
      }, 0);
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
    const toolbar = document.querySelector('.mat-toolbar');
    const mobileMenu = document.querySelector('.mobile-menu-content');
    
    mobileMenu?.classList.add('quick-close');
    this.isMenuOpen = false;
    
    setTimeout(() => {
      mobileMenu?.classList.remove('quick-close');
    }, 300);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    if (this.isMenuOpen && window.innerWidth > 768) {
      const toolbar = document.querySelector('.mat-toolbar');
      toolbar?.classList.add('closing');
      setTimeout(() => {
        this.isMenuOpen = false;
        toolbar?.classList.remove('closing');
      }, 100);
    }
    this.updateContentDivOffset();
  }

  // Add this method to check if a route is active
  isRouteActive(route: string): boolean {
    if (route === '/browse' && this.router.url === '/') {
        return false;
    }
    return this.router.url.startsWith(route);
  }
}
