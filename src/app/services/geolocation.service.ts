import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GeoLocationService {
  /**
   * 获取当前位置，返回一个 GeolocationPosition 的可观察对象
   */
  public getLocation(): Observable<GeolocationPosition> {
    return new Observable((observer) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            observer.next(position);
            observer.complete();
          },
          (error) => {
            observer.error(error);
          },
          {
            enableHighAccuracy: false,
            timeout: 1000 * 5,
          },
        );
      } else {
        observer.error('Geolocation is not supported by this browser.');
      }
    });
  }

  /**
   * 给定一个坐标和半径，判断当前位置是否在指定范围内
   * @param coordinates 经纬度坐标
   * @param radius 半径，单位为米
   */
  public isInArea(
    coordinates: { lat: number; lng: number },
    radius: number,
  ): Observable<boolean> {
    return this.getLocation().pipe(
      switchMap((position) => {
        const distance = this.getDistance(
          coordinates,
          {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        );
        return of(distance <= radius);
      }),
    );
  }

  /**
   * 计算两个坐标之间的距离
   * @param coords1 坐标1
   * @param coords2 坐标2
   * @returns 距离，单位为米
   */
  public getDistance(
    coords1: { lat: number; lng: number },
    coords2: { lat: number; lng: number },
  ): number {
    const radLat1 = (coords1.lat * Math.PI) / 180.0;
    const radLat2 = (coords2.lat * Math.PI) / 180.0;
    const a = radLat1 - radLat2;
    const b = (coords1.lng * Math.PI) / 180.0 - (coords2.lng * Math.PI) / 180.0;
    let s = 2 * Math.asin(
      Math.sqrt(
        Math.sin(a / 2) ** 2 +
          Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(b / 2) ** 2,
      ),
    );
    s = s * 6378.137;
    s = Math.round(s * 10000) / 10;
    return s;
  }
}
