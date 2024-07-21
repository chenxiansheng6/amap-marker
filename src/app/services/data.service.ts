import { Injectable } from '@angular/core';
import { v4 } from 'uuid';
import { BehaviorSubject, Observable, of, switchMap, take, tap } from 'rxjs';

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
  private _dataSource: BehaviorSubject<Data[]> = new BehaviorSubject<Data[]>([]);

  constructor() {}

  get dataSource$(): Observable<Data[]> {
    return this._dataSource.asObservable();
  }

  public dataSource: Data[] = [

  ];

  // 获取点数据
  public getData(): Observable<Data[]> {
    return of(this.dataSource).pipe(
      tap((data) => this._dataSource.next(data)),
    );
  }

  /**
   * 创建标签数据
   * @param data
   */
  public createData(data: Partial<Data>): Observable<Data> {
    return this.dataSource$.pipe(
      take(1),
      switchMap((dataSource) => {
        const newData = { ...data, id: v4() } as Data;
        this._dataSource.next([newData, ...dataSource]);
        return of(newData);
      }),
    );
  }

  /**
   * 更新标签数据
   * @param data
   */
  public updateData(data: Data): Observable<Data> {
    return this.dataSource$.pipe(
      take(1),
      switchMap((dataSource) => {
        const index = dataSource.findIndex((item) => item.id === data.id);
        if (index === -1) return of(data);
        dataSource[index] = data;
        this._dataSource.next(dataSource);
        return of(data);
      }),
    );
  }

  /**
   * 删除标签数据
   * @param id
   */
  public deleteData(id: string): Observable<void> {
    return this.dataSource$.pipe(
      take(1),
      switchMap((dataSource) => {
        const index = dataSource.findIndex((item) => item.id === id);
        if (index === -1) return of(null);
        dataSource.splice(index, 1);
        this._dataSource.next(dataSource);
        return of(null);
      }),
    );
  }
}
