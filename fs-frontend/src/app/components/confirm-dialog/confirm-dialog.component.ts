import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './confirm-dialog.component.html',
  styles: [
    `
      h2.dialog-title {
        font-size: 20px; /* Adjust font size for title */
        font-weight: bold;
        margin-bottom: 16px;
        font-family: "Outfit", sans-serif;
      }

      mat-dialog-content.dialog-content {
        font-family: "Outfit", sans-serif;
        font-size: 16px; /* Adjust font size for content */
        color: #555; /* Optional: Add subtle color */
      }

      mat-dialog-actions {
        margin-top: 16px;
      }

      button[mat-button] {
        font-family: "Outfit", sans-serif;
        font-size: 14px; /* Adjust font size for buttons */
        font-weight: 500;
      }
    `,
  ],
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { action: string; message: string }
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
