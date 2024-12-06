import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-contact-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, CommonModule],
  templateUrl: './contact-dialog.component.html',
  styleUrls: ['./contact-dialog.component.scss'],
})
export class ContactDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ContactDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      orgName: string;
      sellerType: string;
      sellerLocation: string;
      sellerContact: string;
      alreadyRequested: boolean;
    }
  ) {}
}
