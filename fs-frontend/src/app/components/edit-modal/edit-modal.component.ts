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
  imports: [MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, CommonModule, FormsModule],
  templateUrl: './edit-modal.component.html',
})
export class EditDialogComponent {
  values: string[];

  constructor(
    public dialogRef: MatDialogRef<EditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { fields: string[]; values: string[] }
  ) {
    this.values = [...data.values]; // Initialize values with a copy of passed-in values
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close(this.values); // Return the updated values array
  }

  toTitleCase(field: string): string {
    return field.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
  }

  formatFields(fields: string[]): string {
    return fields.map(this.toTitleCase).join(" & ");
  }
}
