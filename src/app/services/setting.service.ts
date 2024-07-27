import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export enum ENV {
  DEV = 'dev',
  PROD = 'prod',
}

const ENDPOINT = {
  [ENV.DEV]: 'http://localhost:3000',
  [ENV.PROD]: 'http://116.62.123.9:3000',
};

@Injectable({
  providedIn: 'root',
})
export class SettingService {
  get endpoint(): string {
    return ENDPOINT[environment.production ? ENV.PROD : ENV.DEV];
  }

  get version(): string {
    return '1.0.0';
  }
}