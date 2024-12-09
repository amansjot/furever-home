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
  selector: 'app-edit-dialog',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    FormsModule,

  ],
  templateUrl: './edit-dialog.component.html',
  styles: [
    `
      h2.dialog-title {
        font-size: 23px;
        font-family: 'Outfit', sans-serif;
        margin-bottom: 16px;
      }

      div.dialog-subtitle {
        border: 1px solid #4ca68b;
        padding: 10px;
        margin: auto;
        width: 80%;
        text-align: center;
        background-color: rgb(229, 235, 230);
      }

      mat-dialog-content.dialog-content {
        font-family: 'Outfit', sans-serif;
        font-size: 16px;
        margin-top: 8px;
        
      }
      
       mat-label {
        font-size: 18px;
        color: black;
      }

      .form-field {
        margin-bottom: 16px;
        font-family: 'Outfit', sans-serif;
      }

      mat-form-field {
        width: 100%;
        
      }

      mat-label {
        font-size: 18px;
      }

      input[matInput] {
        font-size: 16px;
        font-family: 'Outfit', sans-serif;
    
      }

      mat-dialog-actions {
        margin-top: 16px;
      }

      button[mat-button] {
        position: relative;
        font-size: 18px;
        height: 40px;
        width: 110px;
        color:#4ca68b;
        border-radius: 60px;
        border-color: transparent;
        background-color: transparent;
        gap: 7px;
        font-family: 'Outfit', sans-serif;
      }

    button[mat-button]:hover{
      background-color: rgb(229, 235, 230) ;
    }
    `,
  ],
})
export class EditDialogComponent {
  values: string[];
  description;

  constructor(
    public dialogRef: MatDialogRef<EditDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { fields: string[]; values: string[]; description: string }
  ) {
    this.values = [...data.values]; // Initialize values with a copy of passed-in values
    this.description = data.description;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close(this.values); // Return the updated values array
  }

  toTitleCase(field: string): string {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
  }

  formatFields(fields: string[]): string {
    return fields.map(this.toTitleCase).join(' & ');
  }
}
