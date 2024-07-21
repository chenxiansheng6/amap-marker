import { Inject, Injectable } from '@angular/core';
import { v4 } from 'uuid';
import { BehaviorSubject, map, Observable, switchMap, take, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SettingService } from './setting.service';

export interface Data {
  id: string;
  name: string;
  description: string;
  lng: string;
  lat: string;
  images?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private _endpoint = '';

  private _dataSource: BehaviorSubject<Data[]> = new BehaviorSubject<Data[]>([]);

  constructor(
    @Inject(HttpClient) private _http: HttpClient,
    @Inject(SettingService) private _settingService: SettingService,
  ) {
    this._endpoint = this._settingService.endpoint;
  }

  get dataSource$(): Observable<Data[]> {
    return this._dataSource.asObservable();
  }

  public dataSource: Data[] = [

  ];

  // 获取点数据
  public getData(): Observable<Data[]> {
    const url = `${this._endpoint}/api/data`;
    return this._http.get<{ content: Data[] }>(url).pipe(
      map((res) => res.content),
      tap((data) => this._dataSource.next(data)),
    );
  }

  /**
   * 创建标签数据
   * @param data
   */
  public createData(data: Partial<Data>): Observable<Data> {
    const url = `${this._endpoint}/api/data`;
    return this.dataSource$.pipe(
      take(1),
      switchMap((dataSource) => {
        const newData = { ...data, id: v4() } as Data;
        return this._http.post<Data>(url, newData).pipe(
          tap(() => this._dataSource.next([newData, ...dataSource])),
        );
      }),
    );
  }

  /**
   * 更新标签数据
   * @param data
   */
  public updateData(data: Data): Observable<Data> {
    const url = `${this._endpoint}/api/data`;
    return this.dataSource$.pipe(
      take(1),
      switchMap((dataSource) => this._http.put<Data>(url, data).pipe(
        tap(() => {
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
  public deleteData(id: string): Observable<void> {
    const url = `${this._endpoint}/api/data`;
    return this.dataSource$.pipe(
      take(1),
      switchMap((dataSource) => this._http.delete<void>(url, { body: { id } }).pipe(
        tap(() => {
          const index = dataSource.findIndex((item) => item.id === id);
          dataSource.splice(index, 1);
          this._dataSource.next(dataSource);
        }),
      )),
    );
  }
}
