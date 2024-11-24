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
    const oldCardsPerPage = this.cardsPerPage;
    
    // Adjust cards per page based on container width
    if (containerWidth >= 1200) {
        this.cardsPerPage = 4;
    } else if (containerWidth >= 992) {
        this.cardsPerPage = 3;
    } else if (containerWidth >= 576) {
        this.cardsPerPage = 2;
    } else {
        this.cardsPerPage = 1;
    }

    // Calculate card width based on container and gaps
    const totalGaps = this.cardsPerPage - 1;
    const gapWidth = 25; // gap between cards
    const availableWidth = containerWidth - (totalGaps * gapWidth) - 50; // 50px for container padding
    this.cardWidth = (availableWidth / this.cardsPerPage);
    
    // Calculate new total pages
    this.totalPages = Math.ceil(this.featuredPets.length / this.cardsPerPage);
    
    // Calculate current scroll position as a percentage
    const scrollPercentage = container.scrollLeft / (container.scrollWidth - containerWidth);
    
    // Calculate new target page based on scroll percentage
    const newPage = Math.round(scrollPercentage * (this.totalPages - 1));
    this.currentPage = Math.min(Math.max(0, newPage), this.totalPages - 1);
    
    // Update scroll position with a small delay to allow for DOM updates
    setTimeout(() => {
        this.scrollToPage(this.currentPage, false);
    }, 50);
  }

  public scrollToPage(pageIndex: number, smooth: boolean = true) {
    const container = this.cardContainer.nativeElement;
    const pageWidth = this.cardWidth * this.cardsPerPage + ((this.cardsPerPage - 1) * 25); // Include gaps
    const boundedIndex = Math.min(Math.max(0, pageIndex), this.totalPages - 1);
    
    const maxScroll = container.scrollWidth - container.clientWidth;
    let targetScroll = boundedIndex * pageWidth;
    
    // Ensure last page shows all cards properly
    if (boundedIndex === this.totalPages - 1) {
        targetScroll = maxScroll;
    }

    container.scrollTo({
        left: targetScroll,
        behavior: smooth ? 'smooth' : 'auto'
    });
    
    this.currentPage = boundedIndex;
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

    const scrollPosition = container.scrollLeft;
    const containerWidth = container.clientWidth;
    const maxScroll = container.scrollWidth - containerWidth;
    
    // Calculate page width including gaps
    const totalGaps = this.cardsPerPage - 1;
    const gapWidth = 25;
    const pageWidth = (this.cardWidth * this.cardsPerPage) + (totalGaps * gapWidth);
    
    // Calculate current page based on scroll position
    let newPage = Math.round(scrollPosition / pageWidth);
    
    // Handle edge cases
    if (scrollPosition <= 0) {
        newPage = 0;
    } else if (Math.abs(scrollPosition - maxScroll) < 10) {
        newPage = this.totalPages - 1;
    }
    
    // Ensure page is within bounds
    this.currentPage = Math.min(Math.max(0, newPage), this.totalPages - 1);
  }
}
