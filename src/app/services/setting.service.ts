import { Injectable } from '@angular/core';

export enum ENV {
  DEV = 'dev',
  PROD = 'prod',
}

const ENDPOINT = {
  [ENV.DEV]: 'http://api.yz-app.illusiontech.cn:5500',
  [ENV.PROD]: 'https://api.yz-app.illusiontech.cn:5501',
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