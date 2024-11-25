import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-questionnaire',
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.scss']
})
export class QuestionnaireComponent {
  constructor(private router: Router) {}

  onSubmit() {
    this.router.navigate(['/home']); // Navigate to home after submitting the questionnaire
  }
}