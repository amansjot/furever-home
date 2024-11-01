import { Component, HostListener, OnInit } from '@angular/core';
import { LoginService } from '../../services/login.service';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { NavigationEnd, Router, RouterLink, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule,MatToolbarModule,MatButtonModule,MatIconModule,RouterLink,RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent  {
  public disableLogin: boolean = false;
  public authenticated: boolean = false;
  public isAdmin: boolean = false;
  public showButtons:boolean=true;
  constructor(private _loginSvc:LoginService,private router:Router){
    _loginSvc.loggedIn.subscribe(this.onLoginChange);    
    router.events.subscribe({
      next:(event)=>{
        if (event instanceof NavigationEnd && (event.url.indexOf("login")>=0||event.url.indexOf("register")>=0)){
          this.showButtons=false;
        }else{
          this.showButtons=true;
        }
      }
    })

  }

  onLoginChange=async (loggedIn: boolean)=>{
    this.authenticated = loggedIn;
    
    if (loggedIn) {
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        this.isAdmin = await this._loginSvc.isAdmin();
      } catch (error) {
        console.error('Error checking admin status:', error);
        this.isAdmin = false;
      }
    } else {
      this.isAdmin = false;
    }
    
    console.log("Change:"+this.authenticated)
  }
  logout(){
    this._loginSvc.logout();
    this.isAdmin = false;
    this.router.navigate(['/login']);
  }
  async login(){
    this.disableLogin=true;
    await this._loginSvc.login("silber@udel.edu","pass");
    this.disableLogin=false;
  }

  // Navbar css cool stuff:
  isNavbarHidden = false;
  lastScrollPosition = 0;
  public isMenuOpen: boolean = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (!this.isMenuOpen) {
      const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      if (currentScrollPosition > this.lastScrollPosition) {
        // Scrolling down
        this.isNavbarHidden = true;
      } else {
        // Scrolling up
        this.isNavbarHidden = false;
      }
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
    return this.showButtons && (this.authenticated || !this.authenticated);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Get the clicked element
    const clickedElement = event.target as HTMLElement;
    
    // Check if click is outside the menu and toolbar
    const isMenuClick = clickedElement.closest('.menu-overlay');
    const isHamburgerClick = clickedElement.closest('.hamburger-btn');
    
    // Close menu if click is outside and menu is open
    if (!isMenuClick && !isHamburgerClick && this.isMenuOpen) {
      this.isMenuOpen = false;
    }
  }

  onMenuItemClick() {
    this.isMenuOpen = false;
  }
}
