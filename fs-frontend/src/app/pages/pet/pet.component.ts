import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemService } from '../../services/item.service';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../services/login.service';
import { of, delay, switchMap, forkJoin, catchError } from 'rxjs';

@Component({
  selector: 'app-pet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pet.component.html',
  styleUrls: ['./pet.component.scss']
})
export class PetComponent implements OnInit {
  public disableLogin: boolean = false;
  public authenticated: boolean = false;
  public isBuyer: boolean = false;

  pet: any;
  currentImageIndex: number = 0;
  isModalOpen: boolean = false; // Track modal state

  constructor(
    private route: ActivatedRoute,
    private itemService: ItemService,
    private _loginSvc: LoginService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to login changes to update the buyer status dynamically
    this._loginSvc.loggedIn.subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        this._loginSvc.loggedIn.subscribe(this.onLoginChange);
      } else {
        this.isBuyer = false;
      }
    });

    const petId = this.route.snapshot.paramMap.get('id'); // Retrieve ID from route

    if (petId) {
      this.itemService.getItemById(petId).then(
        (pet) => {
          this.pet = pet;
        },
        (error) => console.error("Error fetching pet details:", error)
      );
    }
  }

  formatAge(ageInYears: number): string {
    if (ageInYears < 1) {
      // Convert to months if less than 1 year
      const months = Math.round(ageInYears * 12);
      if (months < 3) {
        // Convert to weeks if less than 3 months
        const weeks = Math.round(months * 4.345); // Approximate weeks in a month
        return `${weeks} week${weeks !== 1 ? 's' : ''}`;
      }
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else {
      // Display in years if 1 year or more
      ageInYears = Math.floor(ageInYears);
      return `${ageInYears} year${ageInYears !== 1 ? 's' : ''}`;
    }
  }

  nextImage(): void {
    if (this.pet.pictures && this.pet.pictures.length) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.pet.pictures.length;
    }
  }

  prevImage(): void {
    if (this.pet.pictures && this.pet.pictures.length) {
      this.currentImageIndex = (this.currentImageIndex - 1 + this.pet.pictures.length) % this.pet.pictures.length;
    }
  }

  goToImage(index: number): void {
    if (this.pet.pictures && index >= 0 && index < this.pet.pictures.length) {
      this.currentImageIndex = index;
    }
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  requestContact() {
    // Show buyer the Seller "contact" and update Seller "requests" to add buyer's $oid
  }

  onLoginChange = (loggedIn: boolean) => {
    this.authenticated = loggedIn;

    if (loggedIn) {
      this.checkUserRoles();
    } else {
      this.isBuyer = false;
    }
    console.log('Change:' + this.authenticated);
  };

  private checkUserRoles(): void {
    of(null)
      .pipe(
        delay(100),
        switchMap(() =>
          forkJoin({
            isBuyer: this._loginSvc.isBuyer().pipe(
              catchError((error) => {
                console.error('Error checking buyer role:', error);
                return of(false);
              })
            ),
          })
        )
      )
      .subscribe(({ isBuyer }) => {
        this.isBuyer = isBuyer;
        if (this.isBuyer) {
          console.log('yes!');
        }
      });
  }

  logout() {
    this._loginSvc.logout();
    this.isBuyer = false;
    this.router.navigate(['/login']);
  }

  async login() {
    this.disableLogin = true;
    await this._loginSvc.login('silber@udel.edu', 'pass');
    this.disableLogin = false;
  }
}
