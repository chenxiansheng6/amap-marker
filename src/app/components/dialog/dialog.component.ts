import { NgClass, NgIf } from '@angular/common';
import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

export interface DialogData {
  title?: string;
  message?: string;
  actions?: {
    confirm?: {
      show?: boolean;
      label?: string;
      color?: 'primary' | 'accent' | 'warn';
    };
    cancel?: {
      show?: boolean;
      label?: string;
    };
  };
}

@Component({
  selector: 'confirmation-dialog',
  templateUrl: './dialog.component.html',
  styles: [
    `
      .cdk-overlay-dark-backdrop {
        background: rgba(0, 0, 0, 0.1);
      }
      .fuse-confirmation-dialog-panel {
        .mat-mdc-dialog-container {
          .mat-mdc-dialog-surface {
            padding: 0 !important;
            border-radius: 12px !important;
            box-shadow: 0px 4px 10px -2px rgba(0, 0, 0, 0.15) !important;
            backdrop-filter: blur(8px);
            background-color: rgb(255 255 255 / 0.5);
          }
        }
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [NgIf, MatDialogModule, NgClass],
})
export class DialogComponent {
  /**
   * Constructor
   */
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}
}
