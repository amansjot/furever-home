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
      setTimeout(() => {
        this.calculatePages();
        this.updateCurrentPage();
      }, 0);
    });

    localStorage.setItem('petHistoryStart', 'browse');

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
        this.totalPages = Math.ceil(this.featuredPets.length / this.cardsPerPage);
    } else if (containerWidth >= 576) {
        this.cardsPerPage = 2;
        this.totalPages = Math.ceil(this.featuredPets.length / this.cardsPerPage);
    } else {
        this.cardsPerPage = 1;
        this.totalPages = Math.ceil(this.featuredPets.length / this.cardsPerPage);
    }
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

    // Wait for cards to be rendered
    const card = container.querySelector('.pet-card');
    if (!card) {
        // If cards aren't loaded yet, try again in a moment
        setTimeout(() => this.updateCurrentPage(), 100);
        return;
    }

    const cardWidth = card.offsetWidth;
    const gap = 25;
    const scrollPosition = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;
    
    if (Math.abs(scrollPosition - maxScroll) < 10) {
        this.currentPage = this.totalPages - 1;
        return;
    }
    
    this.currentPage = Math.round(scrollPosition / ((cardWidth + gap) * this.cardsPerPage));
    this.currentPage = Math.min(this.currentPage, this.totalPages - 1);
  }
}
