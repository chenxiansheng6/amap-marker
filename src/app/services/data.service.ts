import { Inject, Injectable } from '@angular/core';
import { v4 } from 'uuid';
import { BehaviorSubject, map, Observable, switchMap, take, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SettingService } from './setting.service';
import { Data, Response } from '../interfaces';
import { UtilService } from './util.service';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private _endpoint = '';

  private _dataSource: BehaviorSubject<Data[]> = new BehaviorSubject<Data[]>([]);

  public markers: Map<string, AMap.Marker> = new Map();

  constructor(
    @Inject(HttpClient) private _http: HttpClient,
    @Inject(UtilService) private _utilService: UtilService,
    @Inject(SettingService) private _settingService: SettingService,
  ) {
    this._endpoint = this._settingService.endpoint;
  }

  get dataSource$(): Observable<Data[]> {
    return this._dataSource.asObservable();
  }

  // 获取点数据
  public getData(): Observable<Data[]> {
    const url = `${this._endpoint}/api/data`;
    return this._http.get<Response<Data[]>>(url).pipe(
      map((res) => res.success ? res.data : []),
      map((data) => data.map((_) => {
        if (_.images && _.images.length) {
          _.images = _.images.map((img) => this._utilService.getImageUrl(img));
        }
        return _;
      })),
      tap((data) => this._dataSource.next(data)),
    );
  }

  /**
   * 创建标签数据
   * @param data
   */
  public createData(data: Partial<Data>): Observable<boolean> {
    const url = `${this._endpoint}/api/data`;
    return this.dataSource$.pipe(
      take(1),
      switchMap((dataSource) => {
        const newData = {
          ...data,
          id: v4(),
          created_at: new Date().toISOString(),
        } as Data;
        return this._http.post<Response<Data>>(url, newData).pipe(
          map((res) => res.success),
          tap(() => {
            if (newData.images && newData.images.length) {
              newData.images = newData.images.map((img) => this._utilService.getImageUrl(img));
            }
            this._dataSource.next([newData, ...dataSource]);
          }),
        );
      }),
    );
  }

  /**
   * 更新标签数据
   * @param data
   */
  public updateData(data: Data): Observable<boolean> {
    const url = `${this._endpoint}/api/data`;
    return this.dataSource$.pipe(
      take(1),
      switchMap((dataSource) => this._http.put<Response<Data>>(url, {
        ...data,
        updated_at: new Date().toISOString(),
      }).pipe(
        map((res) => res.success),
        tap(() => {
          if (data.images && data.images.length) {
            data.images = data.images.map((img) => this._utilService.getImageUrl(img));
          }
          const index = dataSource.findIndex((item) => item.id === data.id);
          dataSource[index] = data;
          this._dataSource.next(dataSource);
        }),
      )),
    );
  }

  /**
   * 删除标签数据
   * @param id
   */
  public deleteData(id: string): Observable<boolean> {
    const url = `${this._endpoint}/api/data?id=${id}`;
    return this.dataSource$.pipe(
      take(1),
      switchMap((dataSource) => this._http.delete<Response<string>>(url).pipe(
        map((res) => res.success),
        tap(() => {
          const index = dataSource.findIndex((item) => item.id === id);
          dataSource.splice(index, 1);
          this._dataSource.next(dataSource);
          this.markers.get(id)?.setMap(null);
          this.markers.delete(id);
        }),
      )),
    );
  }
}
