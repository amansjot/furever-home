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
  template: `
    <div class="info-box">
      <p>Success! Your contact information has been shared with the seller.</p>
    </div>
    <h1 mat-dialog-title>Seller's Contact Information</h1>
    <div mat-dialog-content>
      <table class="info-table">
        <tr>
          <td class="info-label">Organization Name:</td>
          <td class="info-value">{{ data.orgName || 'N/A' }}</td>
        </tr>
        <tr>
          <td class="info-label">Seller Type:</td>
          <td class="info-value">{{ data.sellerType | titlecase }}</td>
        </tr>
        <tr>
          <td class="info-label">Location:</td>
          <td class="info-value">{{ data.sellerLocation }}</td>
        </tr>
        <tr>
          <td class="info-label">Email:</td>
          <td class="info-value">
            <a href="mailto:{{ data.sellerContact }}">{{
              data.sellerContact
            }}</a>
          </td>
        </tr>
      </table>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-raised-button color="primary" mat-dialog-close>Close</button>
    </div>
  `,
  styles: [
    `
      h1 {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 16px;
      }

      mat-dialog-content {
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .info-box {
        background-color: #e0f7fa; /* Light teal background */
        border: 1px solid #4dd0e1; /* Teal border */
        padding: 12px 16px; /* More padding for better spacing */
        border-radius: 8px 8px 0 0; /* Rounded corners only at the top */
        font-size: 14px;
        color: #006064; /* Darker teal text */
        text-align: center; /* Center-align text */
        margin: 16px 16px -6px 16px; /* Expand to fill dialog width */
      }

      .info-box p {
        margin: 0;
        font-weight: 500;
      }

      .info-table {
        width: 100%;
        border-collapse: collapse;
      }

      .info-table td {
        padding: 8px 12px;
        vertical-align: top;
      }

      .info-label {
        font-size: 14px;
        font-weight: 500;
        color: #555;
        text-align: right;
        width: 40%;
      }

      .info-value {
        font-size: 16px;
        font-weight: 600;
        color: #000;
        text-align: left;
        width: 60%;
      }

      .info-value a {
        color: #1976d2;
        text-decoration: none;
      }

      .info-value a:hover {
        text-decoration: underline;
      }

      mat-dialog-actions {
        margin-top: 16px;
      }

      button[mat-raised-button] {
        font-size: 14px;
        font-weight: 500;
      }
    `,
  ],
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
    }
  ) {}
}
