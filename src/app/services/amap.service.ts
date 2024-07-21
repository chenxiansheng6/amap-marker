import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AmapService {
  #map: AMap.Map | null = null;

  constructor() {}

  get map(): AMap.Map | null {
    return this.#map;
  }

  /**
   * 初始化地图
   * @param el 
   */
  public initMap(el: HTMLElement): void {
    if (!this.#map) {
      this.#map = new AMap.Map(el, {
        zoom: 12,
      });
    }
  }

  /**
   * 显示当前位置标注
   */
  public showCurrent(coords: { longitude: number, latitude: number }): void {
    if (this.#map) {
      const marker = new AMap.Marker({
        position: [coords.longitude, coords.latitude],
      });
      marker.setMap(this.#map);
    }
  }
}
