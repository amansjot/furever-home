import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemService } from '../../services/item.service';
import { InventoryItemModel } from '../../models/items.model';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterLink
  ],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.styles.first-comp.scss', './landing.styles.adopt.scss', './landing.styles.why-choose-us.scss', './landing.styles.testimonials.scss', './landing.styles.team.scss' ],
})
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('cardContainer') cardContainer!: ElementRef;
  
  // Public properties
  public featuredPets: InventoryItemModel[] = []; // List of featured pets to display
  public currentPage: number = 0; // The current page being viewed in the carousel
  public totalPages: number = 0; // Total number of pages in the carousel

  // Private properties
  private cardsPerPage: number = 4; // Default number of cards per page
  private cardWidth: number = 320; // Card width including the gap
  private isDragging: boolean = false; // Tracks whether drag scrolling is active
  private startX: number = 0; // Starting X-coordinate for drag scrolling
  private scrollLeft: number = 0; // Scroll position of the card container

  constructor(private itemService: ItemService) {}

  ngOnInit() {
    // Fetch inventory items and populate featuredPets array
    this.itemService.getInventoryItems(0, {}).then(items => {
      this.featuredPets = items.slice(0, 8); // Display the first 8 items
      setTimeout(() => {
        this.calculatePages(); // Calculate the total pages in the carousel
        this.updateCurrentPage(); // Update the current page index
      }, 0);
    });

    localStorage.setItem('petHistoryStart', 'browse'); // Set the browsing start point

    // Add a resize event listener to handle responsive adjustments
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  ngAfterViewInit() {
    this.setupDragScroll(); // Enable drag-to-scroll functionality
    this.calculatePages(); // Recalculate pages after the view is initialized
  }

  ngOnDestroy() {
    // Remove resize event listener to prevent memory leaks
    window.removeEventListener('resize', this.handleResize.bind(this));
  }

  // Handle window resize to recalculate the number of pages
  private handleResize = () => {
    if (this.resizeTimeout) {
      window.clearTimeout(this.resizeTimeout);
    }
    
    // Debounce the resize event to optimize performance
    this.resizeTimeout = window.setTimeout(() => {
      this.calculatePages();
    }, 200);
  }

  private resizeTimeout: number | null = null;

  // Calculate the total pages based on the container width and cards per page
  private calculatePages() {
    const container = this.cardContainer?.nativeElement;
    if (!container) return;

    const containerWidth = container.clientWidth;
    
    // Adjust cards per page based on screen size
    if (containerWidth >= 1200) {
        this.cardsPerPage = 4;
        this.totalPages = Math.ceil(this.featuredPets.length / this.cardsPerPage);
    } else if (containerWidth >= 576) {
        this.cardsPerPage = 2;
        this.totalPages = Math.ceil(this.featuredPets.length / this.cardsPerPage);
    } else {
        this.cardsPerPage = 1;
        this.totalPages = Math.ceil(this.featuredPets.length / this.cardsPerPage);
    }
  }

  // Scroll to a specific page in the carousel
  public scrollToPage(pageIndex: number, smooth: boolean = true) {
    const container = this.cardContainer.nativeElement;
    const containerWidth = container.clientWidth;
    
    // Calculate card width and gap dynamically
    const cardWidth = container.querySelector('.pet-card').offsetWidth;
    const gap = 25;
    
    // Calculate scroll position based on the page index
    const scrollPosition = pageIndex * (cardWidth + gap) * this.cardsPerPage;
    
    container.scrollTo({
        left: scrollPosition,
        behavior: smooth ? 'smooth' : 'auto'
    });
    
    this.currentPage = pageIndex; // Update the current page index
  }

  // Setup drag-to-scroll functionality for the carousel
  private setupDragScroll() {
    const container = this.cardContainer.nativeElement;
    let startX: number;
    let scrollLeft: number;
    let lastX: number;
    let velocity: number = 0;
    let lastTimestamp: number;
    let animationFrameId: number;

    // Mouse down event: Start tracking drag
    const handleMouseDown = (e: MouseEvent) => {
        this.isDragging = true;
        startX = e.pageX;
        lastX = e.pageX;
        scrollLeft = container.scrollLeft;
        lastTimestamp = Date.now();
        velocity = 0;
        
        container.style.cursor = 'grabbing';
        container.style.scrollBehavior = 'auto';
        container.style.scrollSnapType = 'none';
        
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
    };

    // Mouse move event: Calculate scrolling during drag
    const handleMouseMove = (e: MouseEvent) => {
        if (!this.isDragging) return;
        e.preventDefault();

        const currentX = e.pageX;
        const dx = currentX - lastX;
        const timestamp = Date.now();
        const dt = timestamp - lastTimestamp;
        
        velocity = (dx / (dt || 1)) * 0.5;
        
        animationFrameId = requestAnimationFrame(() => {
            container.scrollLeft -= dx * 0.8; // Apply scrolling effect
            this.updateCurrentPage();
        });

        lastX = currentX;
        lastTimestamp = timestamp;
    };

    // Mouse up event: End drag and apply momentum
    const handleMouseUp = () => {
        if (!this.isDragging) return;
        this.isDragging = false;
        container.style.cursor = 'grab';

        let momentum = velocity * 50;
        let deceleration = 0.95; // Momentum deceleration factor

        const animate = () => {
            if (Math.abs(momentum) > 0.1) {
                container.scrollLeft -= momentum;
                momentum *= deceleration;
                this.updateCurrentPage();
                animationFrameId = requestAnimationFrame(animate);
            }
        };

        animate();
    };

    // Mouse leave event: Handle drag end outside the container
    const handleMouseLeave = () => {
        if (this.isDragging) {
            handleMouseUp();
        }
    };

    // Scroll event: Update the current page index when scrolling stops
    container.addEventListener('scroll', () => {
        if (!this.isDragging) {
            this.updateCurrentPage();
        }
    });

    // Attach mouse event listeners to enable drag scrolling
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mousemove', handleMouseMove);

    this.eventListeners = {
        mousedown: handleMouseDown,
        mouseleave: handleMouseLeave,
        mouseup: handleMouseUp,
        mousemove: handleMouseMove
    };
  }

  private eventListeners: {[key: string]: (e: MouseEvent) => void} = {};

  // Update the current page index based on the scroll position
  private updateCurrentPage() {
    const container = this.cardContainer?.nativeElement;
    if (!container) return;

    // Ensure cards are rendered before calculating page index
    const card = container.querySelector('.pet-card');
    if (!card) {
        setTimeout(() => this.updateCurrentPage(), 100);
        return;
    }

    const cardWidth = card.offsetWidth;
    const gap = 25;
    const scrollPosition = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;
    
    if (Math.abs(scrollPosition - maxScroll) < 10) {
        this.currentPage = this.totalPages - 1; // Handle edge case for last page
        return;
    }
    
    this.currentPage = Math.round(scrollPosition / ((cardWidth + gap) * this.cardsPerPage));
    this.currentPage = Math.min(this.currentPage, this.totalPages - 1);
  }
}
