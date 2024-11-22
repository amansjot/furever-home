import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemService } from '../../services/item.service';
import { InventoryItemModel } from '../../models/items.model';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.styles.first-comp.scss', './landing.styles.adopt.scss'],
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
    const maxScroll = container.scrollWidth - container.clientWidth;
    const pageWidth = this.cardWidth * this.cardsPerPage;
    
    // Check if we're at or very close to the end
    if (Math.abs(scrollPosition - maxScroll) < 10) {
        this.currentPage = this.totalPages - 1;
        return;
    }
    
    // Normal page calculation
    const newPage = Math.round(scrollPosition / pageWidth);
    this.currentPage = Math.min(Math.max(0, newPage), this.totalPages - 1);
  }

  private setupDragScroll() {
    const container = this.cardContainer.nativeElement;
    let dragStartPosition: number;

    const handleMouseDown = (e: MouseEvent) => {
        this.isDragging = true;
        this.startX = e.pageX - container.offsetLeft;
        this.scrollLeft = container.scrollLeft;
        container.style.cursor = 'grabbing';
        dragStartPosition = container.scrollLeft;
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!this.isDragging) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - this.startX) * 2.5;
        container.scrollLeft = this.scrollLeft - walk;
    };

    const handleMouseUp = () => {
        if (!this.isDragging) return;
        
        const dragEndPosition = container.scrollLeft;
        const dragDistance = dragEndPosition - dragStartPosition;
        
        // More lenient threshold for page changes
        if (Math.abs(dragDistance) > 20) { // Reduced threshold
            const direction = dragDistance > 0 ? 1 : -1;
            const targetPage = this.currentPage + direction;
            this.scrollToPage(targetPage, true);
        } else {
            this.scrollToPage(this.currentPage, true);
        }
        
        this.isDragging = false;
        container.style.cursor = 'grab';
    };

    const handleMouseLeave = () => {
        if (this.isDragging) {
            handleMouseUp();
        }
    };

    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('scroll', () => this.updateCurrentPage());

    // Store event listeners for cleanup
    this.eventListeners = {
        mousedown: handleMouseDown,
        mouseleave: handleMouseLeave,
        mouseup: handleMouseUp,
        mousemove: handleMouseMove
    };
  }

  private eventListeners: {[key: string]: (e: MouseEvent) => void} = {};

  private snapToNearestCard() {
    const container = this.cardContainer.nativeElement;
    const scrollPosition = container.scrollLeft;
    const pageWidth = this.cardWidth * this.cardsPerPage;
    
    // Calculate the nearest page based on scroll position
    const nearestPage = Math.round(scrollPosition / pageWidth);
    
    // Ensure we can always reach the first page
    const targetPage = Math.min(Math.max(0, nearestPage), this.totalPages - 1);
    this.scrollToPage(targetPage, true);
  }

  public scrollToPage(pageIndex: number, smooth: boolean = true) {
    const container = this.cardContainer.nativeElement;
    const pageWidth = this.cardWidth * this.cardsPerPage;
    const boundedIndex = Math.min(Math.max(0, pageIndex), this.totalPages - 1);
    
    // Calculate the maximum possible scroll position
    const maxScroll = container.scrollWidth - container.clientWidth;
    let targetScroll = boundedIndex * pageWidth;
    
    // If we're going to the last page, ensure we don't overflow
    if (boundedIndex === this.totalPages - 1) {
        targetScroll = maxScroll;
    }

    requestAnimationFrame(() => {
        container.scrollTo({
            left: targetScroll,
            behavior: smooth ? 'smooth' : 'auto'
        });
        this.currentPage = boundedIndex;
    });
  }
}
