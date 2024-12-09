import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { Router, RouterLink } from '@angular/router';

import {
  atLeastOneSelected,
  validZipCode,
} from './special-validators';
import { BuyerService } from '../../services/buyer.service';

@Component({
  selector: 'app-questionnaire',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatTabsModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.scss'],
})
export class QuestionnaireComponent implements OnInit {
  public errorMsg: string = '';
  public disableSubmit: boolean = false;

  isLoading = false;

  questionnaireForm: FormGroup = new FormGroup({
    petType: new FormControl('', Validators.required),
    petSize: new FormControl('', Validators.required),
    petSex: new FormControl('', Validators.required),
    petAge: new FormControl('', Validators.required),
    petLifestyle: new FormControl([], atLeastOneSelected),
    petPersonality: new FormControl([], atLeastOneSelected),
    petLocation: new FormControl('', [Validators.required, validZipCode]),
  });

  // Options for dropdowns
  animalTypes = ['Dog', 'Cat', 'Reptile', 'Bird', 'Fish', 'Small Mammal', 'Other'];
  animalPersonalities = [
    'Energetic',
    'Calm',
    'Affectionate',
    'Independent',
    'Social',
    'Protective',
    'Intelligent',
    'Adventurous',
  ];
  animalLifestyles = ['Good with Families', 'Ideal for Singles or Couples', 'Low Maintenance', 'Outdoors-Friendly', 'Better Suited for Indoors', 'House Pet', 'Apartment Pet', 'Good with Other Pets', 'Allergy-Friendly', 'Therapeutic', 'Travel-Friendly'];

  constructor(private _router: Router, private buyerService: BuyerService) {}

  ngOnInit(): void { }
  
  skipQuestionnaire(): void {
    console.log('Questionnaire skipped. Redirecting to home...');
    this._router.navigate(['/browse']);
  }

  onSubmit(): void {
    if (!this.questionnaireForm.valid) {
      this.errorMsg = 'Please fill out all required fields.';
      return;
    }

    this.disableSubmit = true;
    this.errorMsg = '';

    const preferences = this.questionnaireForm.value;

    // Call the BuyerService to update preferences
    this.buyerService.updatePreferences(preferences).subscribe({
      next: () => {
        console.log('Preferences updated successfully!');
      },
      error: (err) => {
        console.error('Error updating preferences', err);
      },
    });
    
    this.isLoading = true;
    
    setTimeout(() => {
      this.isLoading = false; 
    }, 2000);

    this._router.navigate(['/browse']);
    this.disableSubmit = false;
  }
}
