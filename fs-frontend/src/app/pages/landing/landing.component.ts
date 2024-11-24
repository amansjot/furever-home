import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemService } from '../../services/item.service';
import { InventoryItemModel } from '../../models/items.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
  ],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.styles.first-comp.scss', './landing.styles.adopt.scss', './landing.styles.why-choose-us.scss', './landing.styles.testimonials.scss', './landing.styles.team.scss' ],
})
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('cardContainer') cardContainer!: ElementRef;
  
  // Public properties
  public featuredPets: InventoryItemModel[] = [];
  public currentPage: number = 0;
  public totalPages: number = 0;

  // Private properties
  private cardsPerPage: number = 4;
  private cardWidth: number = 320; // card width + gap
  private isDragging: boolean = false;
  private startX: number = 0;
  private scrollLeft: number = 0;

  constructor(private itemService: ItemService) {}

  ngOnInit() {
    this.itemService.getInventoryItems(0, {}).then(items => {
      this.featuredPets = items.slice(0, 8);
      this.calculatePages();
    });

    window.addEventListener('resize', this.handleResize.bind(this));
  }

  ngAfterViewInit() {
    this.setupDragScroll();
    this.calculatePages();
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.handleResize.bind(this));
  }

  private handleResize = () => {
    if (this.resizeTimeout) {
      window.clearTimeout(this.resizeTimeout);
    }
    
    this.resizeTimeout = window.setTimeout(() => {
      this.calculatePages();
      this.updateCurrentPage();
    }, 150); // Debounce time
  }

  private resizeTimeout: number | null = null;

  private calculatePages() {
    const container = this.cardContainer?.nativeElement;
    if (!container) return;

    const containerWidth = container.clientWidth;
    
    // Adjust maximum cards based on screen width
    let maxCardsPerPage = 4; // Default max
    
    if (containerWidth >= 2000) {
      maxCardsPerPage = 6; // For very wide screens (2560px)
    } else if (containerWidth >= 1600) {
      maxCardsPerPage = 5; // For wide screens
    }
    
    this.cardsPerPage = Math.min(
      maxCardsPerPage,
      Math.max(1, Math.floor(containerWidth / this.cardWidth))
    );
    
    // Set CSS variable for card width calculation
    container.style.setProperty('--cards-per-page', this.cardsPerPage.toString());
    
    // Calculate new total pages
    this.totalPages = Math.ceil(this.featuredPets.length / this.cardsPerPage);
    
    // Ensure current page is valid
    this.currentPage = Math.min(Math.max(0, this.currentPage), this.totalPages - 1);
    
    // Force scroll position update
    requestAnimationFrame(() => {
      this.scrollToPage(this.currentPage, false);
    });
  }

  private updateCurrentPage() {
    const container = this.cardContainer?.nativeElement;
    if (!container) return;

    const scrollPosition = container.scrollLeft;
    const pageWidth = this.cardWidth * this.cardsPerPage;
    const maxScroll = container.scrollWidth - container.clientWidth;
    
    // Calculate the current page based on scroll position
    let newPage = Math.round(scrollPosition / pageWidth);
    
    // Handle edge case for last page
    if (Math.abs(scrollPosition - maxScroll) < 20) {
        newPage = this.totalPages - 1;
    }
    
    // Update current page with bounds checking
    this.currentPage = Math.min(Math.max(0, newPage), this.totalPages - 1);
  }

  private setupDragScroll() {
    const container = this.cardContainer.nativeElement;
    let startX: number;
    let scrollLeft: number;
    let lastX: number;
    let velocity: number = 0;
    let lastTimestamp: number;
    let animationFrameId: number;

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

    const handleMouseMove = (e: MouseEvent) => {
        if (!this.isDragging) return;
        e.preventDefault();

        const currentX = e.pageX;
        const dx = currentX - lastX;
        const timestamp = Date.now();
        const dt = timestamp - lastTimestamp;
        
        velocity = (dx / (dt || 1)) * 0.5;
        
        animationFrameId = requestAnimationFrame(() => {
            container.scrollLeft -= dx * 0.8;
            this.updateCurrentPage();
        });

        lastX = currentX;
        lastTimestamp = timestamp;
    };

    const handleMouseUp = () => {
        if (!this.isDragging) return;
        this.isDragging = false;
        container.style.cursor = 'grab';

        let momentum = velocity * 50;
        let deceleration = 0.95;

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

    const handleMouseLeave = () => {
        if (this.isDragging) {
            handleMouseUp();
        }
    };

    container.addEventListener('scroll', () => {
        if (!this.isDragging) {
            this.updateCurrentPage();
        }
    });

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

  public scrollToPage(pageIndex: number, smooth: boolean = true) {
    const container = this.cardContainer.nativeElement;
    const pageWidth = this.cardWidth * this.cardsPerPage;
    const boundedIndex = Math.min(Math.max(0, pageIndex), this.totalPages - 1);
    
    const maxScroll = container.scrollWidth - container.clientWidth;
    let targetScroll = boundedIndex * pageWidth;
    
    if (boundedIndex === this.totalPages - 1) {
        targetScroll = maxScroll;
    }

    container.scrollTo({
        left: targetScroll,
        behavior: smooth ? 'smooth' : 'auto'
    });
    
    if (smooth) {
        setTimeout(() => {
            this.currentPage = boundedIndex;
        }, 300);
    } else {
        this.currentPage = boundedIndex;
    }
  }
}
