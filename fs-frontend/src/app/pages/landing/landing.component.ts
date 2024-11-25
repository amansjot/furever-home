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
    }, 200);
  }

  private resizeTimeout: number | null = null;

  private calculatePages() {
    const container = this.cardContainer?.nativeElement;
    if (!container) return;

    const containerWidth = container.clientWidth;
    
    // Calculate how many cards fit in the view and set total pages
    if (containerWidth >= 1200) {
        this.cardsPerPage = 4;
        this.totalPages = 2;  // Always show 2 indicators for large screens
    } else if (containerWidth >= 576) {
        this.cardsPerPage = 2;
        this.totalPages = 4;  // Always show 4 indicators for medium screens
    } else {
        this.cardsPerPage = 1;
        this.totalPages = 8;  // Always show 8 indicators for small screens
    }
    
    // Update current page
    this.updateCurrentPage();
  }

  public scrollToPage(pageIndex: number, smooth: boolean = true) {
    const container = this.cardContainer.nativeElement;
    const containerWidth = container.clientWidth;
    
    // Calculate card width and gap
    const cardWidth = container.querySelector('.pet-card').offsetWidth;
    const gap = 25;
    
    // Calculate scroll position based on cards per page
    const scrollPosition = pageIndex * (cardWidth + gap) * this.cardsPerPage;
    
    container.scrollTo({
        left: scrollPosition,
        behavior: smooth ? 'smooth' : 'auto'
    });
    
    this.currentPage = pageIndex;
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

  private updateCurrentPage() {
    const container = this.cardContainer?.nativeElement;
    if (!container) return;

    const cardWidth = container.querySelector('.pet-card').offsetWidth;
    const gap = 25;
    const scrollPosition = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;
    
    // If we're at or very close to the max scroll position, select the last page
    if (Math.abs(scrollPosition - maxScroll) < 10) {
        this.currentPage = this.totalPages - 1;
        return;
    }
    
    // Calculate current page based on cards per page
    this.currentPage = Math.round(scrollPosition / ((cardWidth + gap) * this.cardsPerPage));
    
    // Ensure we don't exceed the maximum page index
    this.currentPage = Math.min(this.currentPage, this.totalPages - 1);
  }
}
