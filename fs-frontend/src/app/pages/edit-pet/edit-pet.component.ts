import { InventoryItemModel } from './../../models/items.model';
import { Component, input, OnInit } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { async, map, Observable, startWith } from 'rxjs';
import { ItemService } from '../../services/item.service';
import { LoginService } from '../../services/login.service';
import { SellerService } from '../../services/seller.service';

@Component({
  selector: 'app-edit-pet',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatAutocompleteModule,
    RouterLink,
  ],
  templateUrl: './edit-pet.component.html',
  styleUrls: ['./edit-pet.component.scss'],
})
export class EditPetComponent implements OnInit {
  public petForm!: FormGroup;
  public selectedPictures: string[] = [];
  public animalTypes: string[] = [
    'Bird',
    'Cat',
    'Chinchilla',
    'Dog',
    'Fish',
    'Gecko',
    'Guinea Pig',
    'Hamster',
    'Lizard',
    'Mouse',
    'Rabbit',
    'Snake',
    'Tortoise',
    'Turtle',
  ];
  public benefitsList: string[] = [
    'Vet Records',
    'Potty Training',
    'Pet Insurance Discount',
    'Dental Care Kit',
    'Microchipping',
    'Vet Check',
    'Food & Treats',
    'Grooming Kit',
    'Flea & Tick Prevention',
    'Vaccinations & Deworming',
  ];
  public photoPreviews: string[] = [];
  public submitted = false;
  public filteredAnimalTypes: Observable<string[]> = new Observable();
  public loading: boolean = true;
  pet: any = null;

  constructor(
    private route: ActivatedRoute,
    private itemService: ItemService,
    private _loginSvc: LoginService,
    private sellerService: SellerService,
    private router: Router
  ) {}

  noFutureDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const today = new Date();
      const inputDate = new Date(control.value);

      // Check if the date is in the future
      if (inputDate > today) {
        return { futureDate: true }; // Return an error object
      }

      return null; // Valid date
    };
  }

  matchOptionValidator(validOptions: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null; // Skip validation if the field is empty
      const isValid = validOptions.includes(control.value);
      return isValid ? null : { matchOption: true }; // Return error if no match
    };
  }

  checkSeller(petId: string) {
    this.sellerService.getSellerProfile().subscribe({
      next: (data) => {
        if (data.pets && data.pets.includes(petId)) {
          this.loadPet(petId);
        } else {
          console.error('Error: this pet is not yours!');
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error loading seller:', err);
      },
    });
  }

  loadPet(petId: string) {
    // Load the current pet
    this.itemService.getItemById(petId).then(
      (pet) => {
        this.pet = pet;
        this.loading = false;
        this.loadPetData(this.pet);
      },
      (error) => {
        this.loading = false;
        console.error('Error fetching pet details:', error);
      }
    );
  }

  ngOnInit(): void {
    const petId = this.route.snapshot.paramMap.get('id');

    if (petId) {
      this.checkSeller(petId);
    } else {
      this.router.navigate(['/login']);
    }

    this.animalTypes.sort(); // Alphabetize animal list

    this.petForm = new FormGroup({
      name: new FormControl(null, Validators.required),
      animal: new FormControl(null, [
        Validators.required,
        this.matchOptionValidator(this.animalTypes),
      ]),
      breed: new FormControl(null, Validators.required),
      sex: new FormControl(null, Validators.required),
      birthdate: new FormControl(null, [
        Validators.required,
        this.noFutureDateValidator(),
      ]),
      price: new FormControl(null, [
        Validators.required,
        Validators.min(1),
        Validators.pattern(/^\d+$/),
      ]),
      description: new FormControl(null, Validators.required),
      benefits: new FormControl([]),
      pictures: new FormControl([], Validators.required),
    });

    // Filter animal types based on user input
    this.filteredAnimalTypes = this.petForm.get('animal')!.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterAnimalTypes(value || ''))
    );
  }

  private loadPetData(pet: any): void {
    // Set form values with the existing pet data
    this.petForm.patchValue({
      name: pet.name || null,
      animal: this.toTitleCase(pet.animal) || null,
      breed: pet.breed || null,
      sex: this.toTitleCase(pet.sex) || null,
      birthdate: pet.birthdate || null,
      price: pet.price || null,
      description: pet.description || null,
      benefits: pet.benefits || [],
      pictures: pet.pictures || [],
    });

    // Populate pictures array
    if (pet.pictures && pet.pictures.length > 0) {
      this.selectedPictures = pet.pictures;
      this.petForm.get('pictures')?.setValue(this.selectedPictures);
    }
  }

  /**
   * Helper function to convert a string to Title Case
   */
  private toTitleCase(value: string): string {
    if (!value) return value;
    return value
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private _filterAnimalTypes(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.animalTypes.filter((animal) =>
      animal.toLowerCase().includes(filterValue)
    );
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files) {
      Array.from(input.files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (!this.selectedPictures.includes(reader.result as string)) {
            // Only edit the file if it's not already in the selectedPictures array
            this.selectedPictures.push(reader.result as string);
            this.petForm.get('pictures')?.setValue(this.selectedPictures); // Update the form control
            this.petForm.get('pictures')?.updateValueAndValidity(); // Trigger validation
          }
        };
        reader.readAsDataURL(file);
      });

      // Reset the file input value to allow re-uploading the same file
      input.value = '';
    }
  }

  onReorder(event: CdkDragDrop<string[]>): void {
    moveItemInArray(
      this.selectedPictures,
      event.previousIndex,
      event.currentIndex
    );
  }

  removePhoto(index: number): void {
    this.selectedPictures.splice(index, 1); // Remove the selected photo
    this.petForm.get('pictures')?.setValue(this.selectedPictures); // Update the form control

    // Check if the pictures array is empty
    if (this.selectedPictures.length === 0) {
      this.petForm.get('pictures')?.setErrors({ required: true }); // Mark as invalid
    }

    this.petForm.get('pictures')?.updateValueAndValidity(); // Trigger validation
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault(); // Prevent default to allow drop
    const dropArea = event.currentTarget as HTMLElement;
    dropArea.classList.add('dragover'); // Edit a visual cue for dragging
  }

  onDragLeave(event: DragEvent): void {
    const dropArea = event.currentTarget as HTMLElement;
    dropArea.classList.remove('dragover'); // Remove the visual cue
  }

  onDrop(event: DragEvent): void {
    event.preventDefault(); // Prevent default behavior (e.g., opening the file in the browser)
    const dropArea = event.currentTarget as HTMLElement;
    dropArea.classList.remove('dragover'); // Remove the visual cue

    if (event.dataTransfer?.files) {
      this.handleDroppedFiles(event.dataTransfer.files); // Handle the dropped files
    }
  }

  handleDroppedFiles(files: FileList): void {
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        // Check if the file is an image
        const reader = new FileReader();
        reader.onload = () => {
          if (!this.selectedPictures.includes(reader.result as string)) {
            this.selectedPictures.push(reader.result as string);
            this.petForm.get('pictures')?.setValue(this.selectedPictures); // Update the form control
            this.petForm.get('pictures')?.updateValueAndValidity(); // Trigger validation
          }
        };
        reader.readAsDataURL(file);
      } else {
        console.warn(`${file.name} is not an image file and was skipped.`);
      }
    });
  }

  // onPhotoSelected(event: Event): void {
  //   const input = event.target as HTMLInputElement;

  //   if (input?.files) {
  //     const files = Array.from(input.files);

  //     files.forEach((file) => {
  //       const reader = new FileReader();
  //       reader.onload = () => {
  //         this.photoPreviews.push(reader.result as string);
  //       };
  //       reader.readAsDataURL(file);
  //     });
  //   }
  // }

  async onSubmit(): Promise<void> {
    this.submitted = true;

    if (this.petForm.invalid) return;

    const userId = this._loginSvc.getAuthenticatedUserId(); // Retrieve the current seller's ID
    const location = this._loginSvc.getAuthenticatedLocation(); // Retrieve the current seller's location
    const sellerType = this._loginSvc.getAuthenticatedSellerType();

    const resolvedSellerType = await sellerType;

    let petStatus: string = 'Unknown';
    if (resolvedSellerType === 'breeder') {
      petStatus = 'Bred';
    } else if (resolvedSellerType === 'shelter') {
      petStatus = 'Sheltered';
    } else if (resolvedSellerType === 'rehoming') {
      petStatus = 'Rehoming';
    }

    if (!userId || !location) {
      console.error('Seller data cannot be retrieved. Must be logged in.');
      return;
    }

    const formData = {
      ...this.petForm.value,
      status: petStatus,
      location: location,
      sellerId: userId,
    };

    // console.log(JSON.stringify(formData, null, 2));

    this.itemService.updatePetDetails(formData, this.pet._id).subscribe({
      next: () => {
        console.log('Pet edited successfully!');
        this.router.navigate(['/seller']); // Navigate back to the seller's page
      },
      error: (err: any) => {
        console.error('Error editing pet:', err);
        alert('An error occurred while editing the pet.');
      },
    });
  }
}
