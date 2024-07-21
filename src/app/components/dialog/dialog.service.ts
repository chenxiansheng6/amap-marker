import { inject, Injectable } from '@angular/core';
import { MatDialog, type MatDialogRef } from '@angular/material/dialog';
import type { DialogData } from './dialog.component';
import { DialogComponent } from './dialog.component';

@Injectable({ providedIn: 'root' })
export class DialogService {
  private _matDialog: MatDialog = inject(MatDialog);
  private _defaultConfig: DialogData = {
    title: 'Confirm action',
    message: 'Are you sure you want to confirm this action?',
    actions: {
      confirm: {
        show: true,
        label: '确定',
        color: 'primary',
      },
      cancel: {
        show: true,
        label: '取消',
      },
    },
  };
  private _updateConfig: DialogData = {
    title: 'Confirm action',
    message: 'Are you sure you want to confirm this action?',
    actions: {
      confirm: {
        show: true,
        label: '确定',
        color: 'accent',
      },
      cancel: {
        show: true,
        label: '取消',
      },
    },
  };

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  open(
    config: DialogData = {},
  ): MatDialogRef<DialogComponent> {
    // Merge the user config with the default config
    const data = { ...this._defaultConfig };
    this.mergeDeep(data, config);

    // Open the dialog
    return this._matDialog.open(DialogComponent, {
      data,
      autoFocus: false,
      disableClose: true,
      panelClass: 'fuse-confirmation-dialog-panel',
    });
  }

  update(
    config: DialogData = {},
  ): MatDialogRef<DialogComponent> {
    // Merge the user config with the default config
    const data = { ...this._updateConfig };
    this.mergeDeep(data, config);

    // Open the dialog
    return this._matDialog.open(DialogComponent, {
      data,
      autoFocus: false,
      disableClose: true,
      panelClass: 'fuse-confirmation-dialog-panel',
    });
  }

  // 对象深度合并
  private mergeDeep(target, source) {
    const isObject = (obj) => obj && typeof obj === 'object';

    if (!isObject(target) || !isObject(source)) {
      return source;
    }

    for (const key of Object.keys(source)) {
      const targetValue = target[key];
      const sourceValue = source[key];

      if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
        target[key] = targetValue.concat(sourceValue);
      } else if (isObject(targetValue) && isObject(sourceValue)) {
        target[key] = this.mergeDeep(Object.assign({}, targetValue), sourceValue);
      } else {
        target[key] = sourceValue;
      }
    }

    return target;
  }
}
