import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,HeaderComponent,FooterComponent,MatCardModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'fs-frontend';

  constructor(private router: Router) {
    // Subscribe to router events
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // When navigation ends, scroll to top of page
        window.scrollTo(0, 0);
      }
    });
  }
}
