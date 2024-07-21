import { Injectable } from '@angular/core';

export enum ENV {
  DEV = 'dev',
  PROD = 'prod',
}

const ENDPOINT = {
  [ENV.DEV]: 'http://localhost:3000',
  [ENV.PROD]: 'http://localhost:3000',
};

@Injectable({
  providedIn: 'root',
})
export class SettingService {
  get endpoint(): string {
    return ENDPOINT[ENV.DEV];
  }

  get version(): string {
    return '1.0.0';
  }
}